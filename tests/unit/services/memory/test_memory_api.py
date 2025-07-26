"""Test Memory API - magical backend auto-configuration."""

from unittest.mock import Mock, patch

import pytest

from cogency.memory.api import Memory
from cogency.memory.core import MemoryBackend


class MockBackend(MemoryBackend):
    """Mock backend for testing."""

    def __init__(self, **config):
        super().__init__()
        self.config = config

    async def create(self, content, memory_type=None, tags=None, metadata=None, **kwargs):
        pass

    async def read(
        self,
        query=None,
        artifact_id=None,
        search_type=None,
        limit=10,
        threshold=0.7,
        tags=None,
        memory_type=None,
        filters=None,
        **kwargs,
    ):
        pass

    async def update(self, artifact_id, updates):
        pass

    async def delete(self, artifact_id=None, tags=None, filters=None, delete_all=False):
        pass


class TestMemoryAPI:
    @patch("cogency.services.memory")
    def test_create_backend_default(self, mock_memory_func):
        # Setup
        mock_backend_class = Mock(return_value=MockBackend())
        mock_memory_func.return_value = mock_backend_class

        # Execute
        backend = Memory.create()

        # Verify
        mock_memory_func.assert_called_once_with("filesystem")
        mock_backend_class.assert_called_once_with()
        assert isinstance(backend, MockBackend)

    @patch("cogency.services.memory")
    def test_create_backend_custom(self, mock_memory_func):
        # Setup
        mock_backend_class = Mock(return_value=MockBackend())
        mock_memory_func.return_value = mock_backend_class

        # Execute
        backend = Memory.create("chroma", host="localhost", port=8000)

        # Verify
        mock_memory_func.assert_called_once_with("chroma")
        mock_backend_class.assert_called_once_with(host="localhost", port=8000)
        assert isinstance(backend, MockBackend)

    @patch(
        "cogency.services._registry._memory_backends",
        {"filesystem": Mock(), "chroma": Mock(), "pinecone": Mock(), "postgres": Mock()},
    )
    def test_list_backends(self):
        # Execute
        backends = Memory.list_backends()

        # Verify
        expected_backends = ["filesystem", "chroma", "pinecone", "postgres"]
        assert set(backends) == set(expected_backends)

    @patch("cogency.services.memory")
    def test_create_with_embedder(self, mock_memory_func):
        # Setup
        mock_backend_class = Mock(return_value=MockBackend())
        mock_memory_func.return_value = mock_backend_class
        mock_embedding = Mock()

        # Execute
        Memory.create("chroma", embedder=mock_embedding)

        # Verify
        mock_memory_func.assert_called_once_with("chroma")
        mock_backend_class.assert_called_once_with(embedder=mock_embedding)

    @patch("cogency.services.memory")
    def test_create_backend_not_found(self, mock_memory_func):
        # Setup
        mock_memory_func.side_effect = ValueError("Backend 'invalid' not found")

        # Execute & Verify
        with pytest.raises(ValueError, match="Backend 'invalid' not found"):
            Memory.create("invalid")

        mock_memory_func.assert_called_once_with("invalid")


class TestMemoryIntegration:
    @patch("cogency.services.memory")
    def test_magical_creation_pattern(self, mock_memory_func):
        # Setup
        mock_backend_class = Mock(return_value=MockBackend())
        mock_memory_func.return_value = mock_backend_class

        # Execute - zero ceremony creation
        memory = Memory.create()

        # Verify magical behavior
        assert memory is not None
        assert isinstance(memory, MemoryBackend)
        mock_memory_func.assert_called_once_with("filesystem")  # Default backend

    @patch("cogency.services.memory")
    @patch("cogency.services._registry._memory_backends", {"filesystem": Mock(), "chroma": Mock()})
    def test_discovery_integration(self, mock_memory_func):
        # Setup
        mock_backend_class = Mock(return_value=MockBackend())
        mock_memory_func.return_value = mock_backend_class

        # Execute
        available = Memory.list_backends()
        Memory.create(available[0])

        # Verify
        assert len(available) == 2
        assert "filesystem" in available
        mock_memory_func.assert_called_once_with("filesystem")

    @patch("cogency.services.memory")
    def test_config_passthrough(self, mock_memory_func):
        # Setup
        mock_backend_class = Mock(return_value=MockBackend())
        mock_memory_func.return_value = mock_backend_class

        config = {
            "host": "localhost",
            "port": 5432,
            "database": "memory_db",
            "embedder": Mock(),
        }

        # Execute
        Memory.create("postgres", **config)

        # Verify all config passed through
        mock_memory_func.assert_called_once_with("postgres")
        mock_backend_class.assert_called_once_with(**config)
