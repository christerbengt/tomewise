using Tomewise.Api.Domain.Enums;

namespace Tomewise.Api.DTOs;

public record BookItemResponseDto(
    Guid Id,
    Guid BookId,
    string BookTitle,
    string? CoverImageUrl,
    BookCondition Condition,
    BookStatus Status,
    BookItemSource Source,
    DateOnly? AcquiredDate,
    decimal? AcquiredPrice,
    decimal? EstimatedValue,
    string? LocationDescription,
    string? Notes,
    IEnumerable<string> Tags
);