using Tomewise.Api.DTOs;
using System.Text.Json;

namespace Tomewise.Api.Services;

public class IsbnLookupService(HttpClient httpClient)
{
    public async Task<IsbnLookupResultDto?> LookupAsync(string isbn)
    {
        var url = $"https://openlibrary.org/api/books?bibkeys=ISBN:{isbn}&format=json&jscmd=data";

        var response = await httpClient.GetAsync(url);
        if (!response.IsSuccessStatusCode)
            return null;

        var json = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);

        var key = $"ISBN:{isbn}";
        if (!doc.RootElement.TryGetProperty(key, out var bookElement))
            return null;

        var title = bookElement.TryGetProperty("title", out var titleEl)
            ? titleEl.GetString() : null;

        if (title == null)
            return null;

        string? isbn10 = null;
        string? isbn13 = null;
        if (bookElement.TryGetProperty("identifiers", out var identifiers))
        {
            if (identifiers.TryGetProperty("isbn_10", out var isbn10El))
                isbn10 = isbn10El[0].GetString();
            if (identifiers.TryGetProperty("isbn_13", out var isbn13El))
                isbn13 = isbn13El[0].GetString();
        }

        string? coverImageUrl = null;
        if (bookElement.TryGetProperty("cover", out var cover))
            cover.TryGetProperty("large", out var coverEl);
        if (bookElement.TryGetProperty("cover", out var coverObj) &&
            coverObj.TryGetProperty("large", out var largeCover))
            coverImageUrl = largeCover.GetString();

        int? publishedYear = null;
        if (bookElement.TryGetProperty("publish_date", out var publishDate))
        {
            var dateStr = publishDate.GetString();
            if (dateStr != null)
            {
                var yearStr = new string(dateStr.Where(char.IsDigit).ToArray());
                if (yearStr.Length >= 4 &&
                    int.TryParse(yearStr[..4], out var year))
                    publishedYear = year;
            }
        }

        string? publisher = null;
        if (bookElement.TryGetProperty("publishers", out var publishers) &&
            publishers.GetArrayLength() > 0)
            publisher = publishers[0]
                .TryGetProperty("name", out var pubName)
                ? pubName.GetString() : null;

        int? pageCount = null;
        if (bookElement.TryGetProperty("number_of_pages", out var pages))
            pageCount = pages.GetInt32();

        var authors = new List<string>();
        if (bookElement.TryGetProperty("authors", out var authorsEl))
            foreach (var author in authorsEl.EnumerateArray())
                if (author.TryGetProperty("name", out var authorName))
                    authors.Add(authorName.GetString()!);

        return new IsbnLookupResultDto(
            title,
            isbn10,
            isbn13,
            coverImageUrl,
            publishedYear,
            publisher,
            null,
            pageCount,
            authors
        );
    }
}