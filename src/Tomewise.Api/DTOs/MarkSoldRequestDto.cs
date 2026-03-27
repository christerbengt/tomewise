namespace Tomewise.Api.DTOs;

public record MarkSoldRequestDto(
    decimal SoldPrice,
    DateOnly SoldDate
);