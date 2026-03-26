namespace Tomewise.Api.DTOs;

public record UpdateLocationRequestDto(
    string BookCase,
    int ShelfNumber,
    string? CustomCode,
    string? Description
);