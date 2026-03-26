using Tomewise.Api.Domain.Enums;

namespace Tomewise.Api.DTOs;

public record UpdateBookItemRequestDto(
    Guid? LocationId,
    BookCondition Condition,
    BookStatus Status,
    DateOnly? AcquiredDate,
    decimal? AcquiredPrice,
    decimal? EstimatedValue,
    string? UserCoverImagePath,
    string? Notes,
    IEnumerable<string> Tags
);