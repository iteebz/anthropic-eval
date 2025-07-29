"""Test Scrape tool business logic."""

from unittest.mock import MagicMock, patch

import pytest
from resilient_result import Result

from cogency.tools.scrape import Scrape


@pytest.mark.asyncio
async def test_interface():
    """Test scrape tool interface."""
    scrape = Scrape()
    assert scrape.name == "scrape"
    assert scrape.description
    assert hasattr(scrape, "run")


@pytest.mark.asyncio
@patch("trafilatura.fetch_url")
@patch("trafilatura.extract")
@patch("trafilatura.extract_metadata")
async def test_success(mock_metadata, mock_extract, mock_fetch):
    """Test successful content extraction."""
    scrape = Scrape()

    mock_fetch.return_value = "<html><body>Test content</body></html>"
    mock_extract.return_value = "Article content"

    mock_meta = MagicMock()
    mock_meta.title = "Test Article"
    mock_meta.author = "Author"
    mock_metadata.return_value = mock_meta

    result = await scrape.run(url="https://example.com")

    assert result.success
    data = result.data
    assert data["content"] == "Article content"
    assert data["metadata"]["title"] == "Test Article"


@pytest.mark.asyncio
@patch("trafilatura.fetch_url")
async def test_failure(mock_fetch):
    """Test fetch failure handling."""
    scrape = Scrape()
    mock_fetch.return_value = None

    result = await scrape.run(url="https://example.com")

    assert not result.success
    assert "Could not fetch content" in result.error


@pytest.mark.asyncio
@patch("trafilatura.fetch_url")
async def test_exception(mock_fetch):
    """Test exception handling."""
    scrape = Scrape()
    mock_fetch.side_effect = Exception("Network error")

    result = await scrape.run(url="https://example.com")

    assert not result.success
    assert "Scraping failed" in result.error
