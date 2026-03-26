namespace Tomewise.Api.DTOs;

public record CreateLocationRequestDto(
    string BookCase,
    int ShelfNumber,
    string? CustomCode,
    string? Description
);