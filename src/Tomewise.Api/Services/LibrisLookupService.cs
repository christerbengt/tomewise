using System.Text.Json;
using System.Text.RegularExpressions;
using Tomewise.Api.DTOs;

namespace Tomewise.Api.Services;

public class LibrisLookupService(HttpClient httpClient)
{
    public async Task<IsbnLookupResultDto?> LookupAsync(string isbn)
    {
        var url = $"https://libris.kb.se/xsearch?query=isbn:{isbn}&format=json";

        var response = await httpClient.GetAsync(url);
        if (!response.IsSuccessStatusCode)
            return null;

        var json = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);

        if (!doc.RootElement.TryGetProperty("xsearch", out var xsearch))
            return null;

        if (!xsearch.TryGetProperty("records", out var recordsEl) ||
            recordsEl.GetInt32() == 0)
            return null;

        if (!xsearch.TryGetProperty("list", out var list) ||
            list.GetArrayLength() == 0)
            return null;

        var book = list[0];

        var title = book.TryGetProperty("title", out var titleEl)
            ? titleEl.GetString() : null;

        if (title == null)
            return null;

        // Strip birth/death years from creator e.g. "Tjechov, Anton, 1860-1904"
        var creator = book.TryGetProperty("creator", out var creatorEl)
            ? creatorEl.GetString() : null;

        var authors = new List<string>();
        if (creator != null)
        {
            var cleaned = Regex.Replace(creator, @",?\s*\d{4}-?\d{0,4}$", "").Trim();
            if (!string.IsNullOrEmpty(cleaned))
                authors.Add(cleaned);
        }

        string? publisher = null;
        try
        {
            if (book.TryGetProperty("publisher", out var publisherEl))
            {
                string? raw = null;

                if (publisherEl.ValueKind == JsonValueKind.Array && publisherEl.GetArrayLength() > 0)
                    raw = publisherEl[0].GetString();
                else if (publisherEl.ValueKind == JsonValueKind.String)
                    raw = publisherEl.GetString();

                if (raw != null)
                {
                    var parts = raw.Split(':');
                    publisher = parts.Length > 1
                        ? parts[1].Trim()
                        : parts[0].Trim();
                }
            }
        }
        catch
        {
            publisher = null;
        }

        int? publishedYear = null;
        if (book.TryGetProperty("date", out var dateEl))
        {
            var dateStr = dateEl.GetString();
            if (dateStr != null && int.TryParse(dateStr.Trim(), out var year))
                publishedYear = year;
        }

        string? language = null;
        if (book.TryGetProperty("language", out var langEl))
            language = langEl.GetString();

        return new IsbnLookupResultDto(
            title,
            null,
            isbn,
            null,
            publishedYear,
            publisher,
            language,
            null,
            authors
        );
    }
}