using Tomewise.Api.Domain.Enums;

namespace Tomewise.Api.DTOs;

public record CreateListingRequestDto(
    Guid BookItemId,
    decimal AskingPrice,
    DateOnly ListedDate,
    ListingPlatform Platform,
    string? Description
);