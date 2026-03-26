namespace Tomewise.Api.DTOs;

public record CreateLendingRecordRequestDto(
    Guid BookItemId,
    string BorrowerName,
    string? BorrowerContact,
    DateOnly LentDate,
    DateOnly? ExpectedReturnDate
);