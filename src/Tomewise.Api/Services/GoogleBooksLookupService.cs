using System.Text.Json;
using Tomewise.Api.DTOs;

namespace Tomewise.Api.Services;

public class GoogleBooksLookupService(HttpClient httpClient)
{
    public async Task<IsbnLookupResultDto?> LookupAsync(string isbn)
    {
        var url = $"https://www.googleapis.com/books/v1/volumes?q=isbn:{isbn}";

        var response = await httpClient.GetAsync(url);
        if (!response.IsSuccessStatusCode)
            return null;

        var json = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);

        if (!doc.RootElement.TryGetProperty("totalItems", out var totalItems) ||
            totalItems.GetInt32() == 0)
            return null;

        if (!doc.RootElement.TryGetProperty("items", out var items) ||
            items.GetArrayLength() == 0)
            return null;

        var book = items[0];

        if (!book.TryGetProperty("volumeInfo", out var info))
            return null;

        var title = info.TryGetProperty("title", out var titleEl)
            ? titleEl.GetString() : null;

        if (title == null)
            return null;

        var authors = new List<string>();
        if (info.TryGetProperty("authors", out var authorsEl))
            foreach (var author in authorsEl.EnumerateArray())
                authors.Add(author.GetString()!);

        string? publisher = null;
        if (info.TryGetProperty("publisher", out var publisherEl))
            publisher = publisherEl.GetString();

        int? publishedYear = null;
        if (info.TryGetProperty("publishedDate", out var dateEl))
        {
            var dateStr = dateEl.GetString();
            if (dateStr != null && dateStr.Length >= 4 &&
                int.TryParse(dateStr[..4], out var year))
                publishedYear = year;
        }

        string? language = null;
        if (info.TryGetProperty("language", out var langEl))
            language = langEl.GetString();

        int? pageCount = null;
        if (info.TryGetProperty("pageCount", out var pagesEl))
            pageCount = pagesEl.GetInt32();

        string? coverImageUrl = null;
        if (info.TryGetProperty("imageLinks", out var images))
        {
            if (images.TryGetProperty("large", out var large))
                coverImageUrl = large.GetString();
            else if (images.TryGetProperty("medium", out var medium))
                coverImageUrl = medium.GetString();
            else if (images.TryGetProperty("thumbnail", out var thumbnail))
                coverImageUrl = thumbnail.GetString();
        }

        // Fix Google Books HTTP image URLs to HTTPS
        if (coverImageUrl != null && coverImageUrl.StartsWith("http://"))
            coverImageUrl = coverImageUrl.Replace("http://", "https://");

        string? isbn10 = null;
        string? isbn13 = null;
        if (info.TryGetProperty("industryIdentifiers", out var identifiers))
        {
            foreach (var id in identifiers.EnumerateArray())
            {
                if (!id.TryGetProperty("type", out var type) ||
                    !id.TryGetProperty("identifier", out var identifier))
                    continue;

                if (type.GetString() == "ISBN_10")
                    isbn10 = identifier.GetString();
                else if (type.GetString() == "ISBN_13")
                    isbn13 = identifier.GetString();
            }
        }

        return new IsbnLookupResultDto(
            title,
            isbn10,
            isbn13,
            coverImageUrl,
            publishedYear,
            publisher,
            language,
            pageCount,
            authors
        );
    }
}