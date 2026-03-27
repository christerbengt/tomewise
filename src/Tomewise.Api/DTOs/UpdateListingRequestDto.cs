using Tomewise.Api.Domain.Enums;

namespace Tomewise.Api.DTOs;

public record UpdateListingRequestDto(
    decimal AskingPrice,
    ListingPlatform Platform,
    string? Description
);