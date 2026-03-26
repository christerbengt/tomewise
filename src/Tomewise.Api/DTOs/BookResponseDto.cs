namespace Tomewise.Api.DTOs;

public record BookResponseDto(
    Guid Id,
    string Title,
    string? Isbn10,
    string? Isbn13,
    string? CoverImageUrl,
    int? PublishedYear,
    string? Publisher,
    string? Language,
    int? PageCount,
    IEnumerable<string> Authors,
    IEnumerable<string> Genres
);