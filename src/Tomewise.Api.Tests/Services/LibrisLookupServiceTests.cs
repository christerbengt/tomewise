using System.Net;
using System.Text;
using Moq;
using Tomewise.Api.Services;

namespace Tomewise.Api.Tests.Services;

public class LibrisLookupServiceTests
{
    private static LibrisLookupService CreateService(string jsonResponse)
    {
        var handler = new MockHttpMessageHandler(jsonResponse);
        var httpClient = new HttpClient(handler);
        return new LibrisLookupService(httpClient);
    }

    [Fact]
    public async Task LookupAsync_ReturnsBook_WhenIsbnFound()
    {
        var json = """
        {
            "xsearch": {
                "from": 1, "to": 1, "records": 1,
                "list": [{
                    "title": "Vad är marxism?",
                    "creator": "Woods, Alan",
                    "isbn": "9789198314618",
                    "publisher": ["Göteborg : Bokförlaget Stormklockan"],
                    "date": "2019",
                    "language": "swe"
                }]
            }
        }
        """;

        var service = CreateService(json);
        var result = await service.LookupAsync("9789198314618");

        Assert.NotNull(result);
        Assert.Equal("Vad är marxism?", result.Title);
        Assert.Equal("Woods, Alan", result.Authors.First());
        Assert.Equal("Bokförlaget Stormklockan", result.Publisher);
        Assert.Equal(2019, result.PublishedYear);
        Assert.Equal("swe", result.Language);
    }

    [Fact]
    public async Task LookupAsync_ReturnsNull_WhenIsbnNotFound()
    {
        var json = """{"xsearch": {"from": 0, "to": 0, "records": 0, "list": []}}""";

        var service = CreateService(json);
        var result = await service.LookupAsync("0000000000000");

        Assert.Null(result);
    }

    [Fact]
    public async Task LookupAsync_StripsYearsFromCreator()
    {
        var json = """
        {
            "xsearch": {
                "records": 1,
                "list": [{
                    "title": "Tre systrar",
                    "creator": "Tjechov, Anton, 1860-1904",
                    "publisher": ["Stockholm : Natur och kultur"],
                    "date": "1995",
                    "language": "swe"
                }]
            }
        }
        """;

        var service = CreateService(json);
        var result = await service.LookupAsync("9127055795");

        Assert.NotNull(result);
        Assert.Equal("Tjechov, Anton", result.Authors.First());
    }

    [Fact]
    public async Task LookupAsync_HandlesPublisherAsString()
    {
        var json = """
        {
            "xsearch": {
                "records": 1,
                "list": [{
                    "title": "Test Book",
                    "publisher": "Stockholm : TestPublisher",
                    "date": "2020",
                    "language": "swe"
                }]
            }
        }
        """;

        var service = CreateService(json);
        var result = await service.LookupAsync("1234567890123");

        Assert.NotNull(result);
        Assert.Equal("TestPublisher", result.Publisher);
    }
}

public class MockHttpMessageHandler(string response) : HttpMessageHandler
{
    protected override Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request,
        CancellationToken cancellationToken)
    {
        return Task.FromResult(new HttpResponseMessage
        {
            StatusCode = HttpStatusCode.OK,
            Content = new StringContent(response, Encoding.UTF8, "application/json")
        });
    }
}