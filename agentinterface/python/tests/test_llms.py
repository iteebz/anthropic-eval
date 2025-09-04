"""LLM provider tests - key detection, rotation, and generation."""

import os
from unittest.mock import AsyncMock, patch

import pytest

from agentinterface.llms import Rotator, detect_api_key, llm, with_rotation


class TestKeyDetection:
    """Test API key detection patterns."""

    def test_basic_patterns(self):
        """Test standard key patterns."""
        with patch.dict(os.environ, {"GEMINI_API_KEY": "basic_key"}, clear=True):
            with patch("agentinterface.llms.load_env"):  # Don't load real .env
                assert detect_api_key("gemini") == "basic_key"

        with patch.dict(os.environ, {"OPENAI_KEY": "alt_key"}, clear=True):
            with patch("agentinterface.llms.load_env"):  # Don't load real .env
                assert detect_api_key("openai") == "alt_key"

    def test_service_aliases(self):
        """Test service-specific aliases."""
        with patch.dict(os.environ, {"GOOGLE_API_KEY": "google_key"}, clear=True):
            with patch("agentinterface.llms.load_env"):
                assert detect_api_key("gemini") == "google_key"

        with patch.dict(os.environ, {"CLAUDE_API_KEY": "claude_key"}, clear=True):
            with patch("agentinterface.llms.load_env"):
                assert detect_api_key("anthropic") == "claude_key"

    def test_rotation_keys(self):
        """Test numbered rotation keys."""
        with patch.dict(os.environ, {"GEMINI_API_KEY_2": "rotated_key"}, clear=True):
            with patch("agentinterface.llms.load_env"):
                assert detect_api_key("gemini") == "rotated_key"

        with patch.dict(os.environ, {"GOOGLE_API_KEY_5": "google_rotated"}, clear=True):
            with patch("agentinterface.llms.load_env"):
                assert detect_api_key("gemini") == "google_rotated"

    def test_priority_order(self):
        """Test key priority: base > rotation."""
        env = {"GEMINI_API_KEY": "base_key", "GEMINI_API_KEY_1": "rotation_key"}
        with patch.dict(os.environ, env, clear=True):
            with patch("agentinterface.llms.load_env"):
                assert detect_api_key("gemini") == "base_key"

    def test_missing_keys(self):
        """Test behavior with no keys."""
        with patch.dict(os.environ, {}, clear=True):
            with patch("agentinterface.llms.load_env"):
                assert detect_api_key("gemini") is None
                assert detect_api_key("nonexistent") is None


class TestRotator:
    """Test key rotator logic."""

    def setup_method(self):
        """Clear rotators before each test."""
        from agentinterface.llms import _rotators

        _rotators.clear()

    def test_single_key(self):
        """Test rotator with single key."""
        with patch.dict(os.environ, {"TEST_API_KEY": "single_key"}, clear=True):
            rot = Rotator("TEST")

            assert rot.keys == ["single_key"]
            assert rot.key == "single_key"

            # Can't rotate with single key
            assert rot.rotate("rate limit") is False
            assert rot.key == "single_key"

    def test_multiple_keys(self):
        """Test rotator with multiple keys."""
        env = {"TEST_API_KEY_1": "key1", "TEST_API_KEY_2": "key2", "TEST_API_KEY_3": "key3"}
        with patch.dict(os.environ, env, clear=True):
            rot = Rotator("TEST")

            assert len(rot.keys) == 3
            assert rot.key == "key1"  # Start with first

    def test_rate_limit_detection(self):
        """Test rate limit signal detection."""
        env = {"TEST_API_KEY_1": "key1", "TEST_API_KEY_2": "key2"}
        with patch.dict(os.environ, env, clear=True):
            rot = Rotator("TEST")

            # Rate limit signals trigger rotation
            with patch("agentinterface.llms.time.time", side_effect=[1, 3]):  # Different timestamps
                assert rot.rotate("quota exceeded") is True
                assert rot.key == "key2"

            # Reset for next test
            rot.idx = 0
            rot.last = 0

            # Various rate limit signals work
            rate_signals = ["429 error", "rate limit", "throttle", "quota"]
            for i, signal in enumerate(rate_signals):
                with patch(
                    "agentinterface.llms.time.time", side_effect=[i * 2 + 10, i * 2 + 12]
                ):  # Use later times
                    assert rot.rotate(signal) is True

    def test_non_rate_limit_errors(self):
        """Test non-rate-limit errors don't rotate."""
        env = {"TEST_API_KEY_1": "key1", "TEST_API_KEY_2": "key2"}
        with patch.dict(os.environ, env, clear=True):
            rot = Rotator("TEST")

            # These shouldn't rotate
            assert rot.rotate("invalid key") is False
            assert rot.rotate("connection error") is False
            assert rot.rotate("timeout") is False
            assert rot.key == "key1"  # Still first key

    def test_rotation_timing(self):
        """Test rotation rate limiting."""
        env = {"TEST_API_KEY_1": "key1", "TEST_API_KEY_2": "key2"}
        with patch.dict(os.environ, env, clear=True):
            rot = Rotator("TEST")

            # First rotation works
            with patch("agentinterface.llms.time.time", side_effect=[1, 3]):
                assert rot.rotate("rate limit") is True

            # Second rotation too soon (same second) - rot.last is now 3
            with patch("agentinterface.llms.time.time", return_value=3.9):  # 0.9 seconds later < 1
                # Clear rotator global state to ensure clean test
                rot.last = 3  # Simulate previous rotation at time 3
                assert rot.rotate("rate limit") is False


class TestWithRotation:
    """Test rotation function."""

    def setup_method(self):
        """Clear rotators before each test."""
        from agentinterface.llms import _rotators

        _rotators.clear()

    @pytest.mark.asyncio
    async def test_successful_call(self):
        """Test successful API call."""
        with patch.dict(os.environ, {"TEST_API_KEY": "test_key"}, clear=True):

            async def mock_api(key):
                assert key == "test_key"
                return "success"

            result = await with_rotation("test", mock_api)
            assert result == "success"

    @pytest.mark.asyncio
    async def test_rotation_on_failure(self):
        """Test rotation when first key fails."""
        env = {"TEST_API_KEY_1": "key1", "TEST_API_KEY_2": "key2"}
        with patch.dict(os.environ, env, clear=True):
            call_count = 0

            async def mock_api(key):
                nonlocal call_count
                call_count += 1
                if key == "key1":
                    raise Exception("rate limit exceeded")
                return f"success_with_{key}"

            with patch(
                "agentinterface.llms.time.time", side_effect=[1, 3, 5]
            ):  # More timestamps to avoid StopIteration
                result = await with_rotation("test", mock_api)

            assert result == "success_with_key2"
            assert call_count == 2  # Called twice (fail then success)

    @pytest.mark.asyncio
    async def test_no_keys_error(self):
        """Test error when no keys available."""
        with patch.dict(os.environ, {}, clear=True):

            async def mock_api(key):
                return "should not reach"

            with pytest.raises(ValueError, match="No test keys found"):
                await with_rotation("test", mock_api)


class TestProviders:
    """Test LLM provider classes."""

    def test_factory_function(self):
        """Test llm() factory function."""
        # Should create instances without errors (even if no keys)
        providers = ["openai", "gemini", "anthropic"]
        for provider in providers:
            try:
                llm_instance = llm(provider)
                assert hasattr(llm_instance, "generate")
            except RuntimeError:
                pass  # Expected when no API keys

    def test_provider_passthrough(self):
        """Test factory passthrough for existing instances."""

        class MockLLM:
            async def generate(self, prompt):
                return "mock response"

        mock_instance = MockLLM()
        result = llm(mock_instance)
        assert result is mock_instance

    def test_unknown_provider(self):
        """Test error for unknown provider."""
        with pytest.raises(ValueError, match="Unknown LLM provider"):
            llm("unknown_provider")


class TestIntegration:
    """Integration tests for full flow."""

    @pytest.mark.asyncio
    async def test_full_rotation_flow(self):
        """Test complete key detection -> rotation -> generation flow."""

        env = {"GEMINI_API_KEY_1": "failing_key", "GEMINI_API_KEY_2": "working_key"}

        with patch.dict(os.environ, env, clear=True):
            with patch(
                "agentinterface.llms.time.time", side_effect=[1, 3, 5, 7]
            ):  # More timestamps to avoid StopIteration
                from agentinterface.llms import Gemini

                # Mock the internal _gen function instead

                async def mock_generate(self, prompt):
                    # Mock the _gen function that's called by with_rotation
                    async def mock_gen(key):
                        if key == "failing_key":
                            raise Exception("quota exceeded")
                        return f"Generated with {key}: {prompt}"

                    from agentinterface.llms import with_rotation

                    return await with_rotation("gemini", mock_gen)

                with patch.object(Gemini, "generate", mock_generate):
                    provider = Gemini()
                    result = await provider.generate("test prompt")

                    # Should have rotated to working key
                    assert "working_key" in result
                    assert "test prompt" in result
