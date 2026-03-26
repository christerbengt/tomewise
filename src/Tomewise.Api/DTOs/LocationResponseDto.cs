namespace Tomewise.Api.DTOs;

public record LocationResponseDto(
    Guid Id,
    string BookCase,
    int ShelfNumber,
    string? CustomCode,
    string? Description,
    int BookCount
);