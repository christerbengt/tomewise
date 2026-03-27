using Tomewise.Api.Domain.Enums;

namespace Tomewise.Api.DTOs;

public record ListingResponseDto(
    Guid Id,
    Guid BookItemId,
    string BookTitle,
    string? CoverImageUrl,
    decimal AskingPrice,
    decimal? SoldPrice,
    DateOnly ListedDate,
    DateOnly? SoldDate,
    ListingPlatform Platform,
    ListingStatus Status,
    string? Description
);