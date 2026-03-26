using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Tomewise.Api.Data;
using Tomewise.Api.Domain.Entities;
using Tomewise.Api.Domain.Enums;
using Tomewise.Api.DTOs;

namespace Tomewise.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class LendingController(BookTrackerDbContext context) : ControllerBase
{
    private string GetUserId() =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<LendingRecordResponseDto>>> GetLendingRecords()
    {
        var userId = GetUserId();

        var records = await context.LendingRecords
            .Where(lr => lr.BookItem.UserId == userId)
            .Include(lr => lr.BookItem)
                .ThenInclude(bi => bi.Book)
            .OrderBy(lr => lr.ReturnedDate == null)
            .ThenBy(lr => lr.ExpectedReturnDate)
            .ToListAsync();

        return Ok(records.Select(MapToResponse));
    }

    [HttpGet("active")]
    public async Task<ActionResult<IEnumerable<LendingRecordResponseDto>>> GetActiveLendings()
    {
        var userId = GetUserId();

        var records = await context.LendingRecords
            .Where(lr => lr.BookItem.UserId == userId && lr.ReturnedDate == null)
            .Include(lr => lr.BookItem)
                .ThenInclude(bi => bi.Book)
            .OrderBy(lr => lr.ExpectedReturnDate)
            .ToListAsync();

        return Ok(records.Select(MapToResponse));
    }

    [HttpGet("overdue")]
    public async Task<ActionResult<IEnumerable<LendingRecordResponseDto>>> GetOverdueLendings()
    {
        var userId = GetUserId();
        var today = DateOnly.FromDateTime(DateTime.Today);

        var records = await context.LendingRecords
            .Where(lr =>
                lr.BookItem.UserId == userId &&
                lr.ReturnedDate == null &&
                lr.ExpectedReturnDate < today)
            .Include(lr => lr.BookItem)
                .ThenInclude(bi => bi.Book)
            .OrderBy(lr => lr.ExpectedReturnDate)
            .ToListAsync();

        return Ok(records.Select(MapToResponse));
    }

    [HttpPost]
    public async Task<ActionResult<LendingRecordResponseDto>> LendBook(
        [FromBody] CreateLendingRecordRequestDto request)
    {
        var userId = GetUserId();

        var bookItem = await context.BookItems
            .Include(bi => bi.Book)
            .FirstOrDefaultAsync(bi =>
                bi.UserId == userId && bi.Id == request.BookItemId);

        if (bookItem == null)
            return NotFound("Book item not found");

        if (bookItem.Status == BookStatus.Lent)
            return Conflict("This book is already lent out");

        if (bookItem.Status == BookStatus.ForSale || bookItem.Status == BookStatus.Sold)
            return Conflict("This book is listed for sale or already sold");

        var record = new LendingRecord
        {
            Id = Guid.NewGuid(),
            BookItemId = request.BookItemId,
            BorrowerName = request.BorrowerName,
            BorrowerContact = request.BorrowerContact,
            LentDate = request.LentDate,
            ExpectedReturnDate = request.ExpectedReturnDate
        };

        bookItem.Status = BookStatus.Lent;

        context.LendingRecords.Add(record);
        await context.SaveChangesAsync();

        await context.Entry(record).Reference(r => r.BookItem).LoadAsync();
        await context.Entry(record.BookItem).Reference(bi => bi.Book).LoadAsync();

        return CreatedAtAction(nameof(GetLendingRecords),
            new { id = record.Id }, MapToResponse(record));
    }

    [HttpPut("{id}/return")]
    public async Task<IActionResult> ReturnBook(Guid id,
        [FromBody] ReturnBookRequestDto request)
    {
        var userId = GetUserId();

        var record = await context.LendingRecords
            .Include(lr => lr.BookItem)
            .FirstOrDefaultAsync(lr =>
                lr.Id == id && lr.BookItem.UserId == userId);

        if (record == null)
            return NotFound();

        if (record.ReturnedDate.HasValue)
            return Conflict("This book has already been returned");

        record.ReturnedDate = request.ReturnedDate;
        record.BookItem.Status = BookStatus.InCollection;

        await context.SaveChangesAsync();
        return NoContent();
    }

    private static LendingRecordResponseDto MapToResponse(LendingRecord record) => new(
        record.Id,
        record.BookItemId,
        record.BookItem.Book.Title,
        record.BookItem.Book.CoverImageUrl,
        record.BorrowerName,
        record.BorrowerContact,
        record.LentDate,
        record.ExpectedReturnDate,
        record.ReturnedDate,
        record.IsOverdue
    );
}