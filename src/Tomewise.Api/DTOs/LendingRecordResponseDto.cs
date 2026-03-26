namespace Tomewise.Api.DTOs;

public record LendingRecordResponseDto(
    Guid Id,
    Guid BookItemId,
    string BookTitle,
    string? CoverImageUrl,
    string BorrowerName,
    string? BorrowerContact,
    DateOnly LentDate,
    DateOnly? ExpectedReturnDate,
    DateOnly? ReturnedDate,
    bool IsOverdue
);