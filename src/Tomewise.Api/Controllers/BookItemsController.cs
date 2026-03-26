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
public class BookItemsController(BookTrackerDbContext context) : ControllerBase
{
    private string GetUserId() =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BookItemResponseDto>>> GetBookItems()
    {
        var userId = GetUserId();

        var items = await context.BookItems
            .Where(bi => bi.UserId == userId)
            .Include(bi => bi.Book)
            .Include(bi => bi.Location)
            .Include(bi => bi.BookItemTags)
                .ThenInclude(bt => bt.Tag)
            .ToListAsync();

        return Ok(items.Select(MapToResponse));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BookItemResponseDto>> GetBookItem(Guid id)
    {
        var userId = GetUserId();

        var item = await context.BookItems
            .Where(bi => bi.UserId == userId && bi.Id == id)
            .Include(bi => bi.Book)
            .Include(bi => bi.Location)
            .Include(bi => bi.BookItemTags)
                .ThenInclude(bt => bt.Tag)
            .FirstOrDefaultAsync();

        if (item == null)
            return NotFound();

        return Ok(MapToResponse(item));
    }

    [HttpPost]
    public async Task<ActionResult<BookItemResponseDto>> CreateBookItem(
        [FromBody] CreateBookItemRequestDto request)
    {
        var userId = GetUserId();

        var book = await context.Books.FindAsync(request.BookId);
        if (book == null)
            return BadRequest("Book not found");

        var item = new BookItem
        {
            Id = Guid.NewGuid(),
            BookId = request.BookId,
            LocationId = request.LocationId,
            UserId = userId,
            Condition = request.Condition,
            Status = request.Status,
            Source = BookItemSource.Manual,
            AcquiredDate = request.AcquiredDate,
            AcquiredPrice = request.AcquiredPrice,
            EstimatedValue = request.EstimatedValue,
            UserCoverImagePath = request.UserCoverImagePath,
            Notes = request.Notes
        };

        foreach (var tagName in request.Tags)
        {
            var tag = await context.Tags
                .FirstOrDefaultAsync(t => t.Name == tagName && t.UserId == userId)
                ?? new Tag { Id = Guid.NewGuid(), Name = tagName, UserId = userId };

            item.BookItemTags.Add(new BookItemTag { BookItem = item, Tag = tag });
        }

        context.BookItems.Add(item);
        await context.SaveChangesAsync();

        await context.Entry(item).Reference(i => i.Book).LoadAsync();
        await context.Entry(item).Reference(i => i.Location).LoadAsync();

        return CreatedAtAction(nameof(GetBookItem), new { id = item.Id }, MapToResponse(item));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBookItem(Guid id,
        [FromBody] UpdateBookItemRequestDto request)
    {
        var userId = GetUserId();

        var item = await context.BookItems
            .Where(bi => bi.UserId == userId && bi.Id == id)
            .Include(bi => bi.BookItemTags)
                .ThenInclude(bt => bt.Tag)
            .FirstOrDefaultAsync();

        if (item == null)
            return NotFound();

        item.LocationId = request.LocationId;
        item.Condition = request.Condition;
        item.Status = request.Status;
        item.AcquiredDate = request.AcquiredDate;
        item.AcquiredPrice = request.AcquiredPrice;
        item.EstimatedValue = request.EstimatedValue;
        item.UserCoverImagePath = request.UserCoverImagePath;
        item.Notes = request.Notes;

        item.BookItemTags.Clear();
        foreach (var tagName in request.Tags)
        {
            var tag = await context.Tags
                .FirstOrDefaultAsync(t => t.Name == tagName && t.UserId == userId)
                ?? new Tag { Id = Guid.NewGuid(), Name = tagName, UserId = userId };

            item.BookItemTags.Add(new BookItemTag { BookItem = item, Tag = tag });
        }

        await context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBookItem(Guid id)
    {
        var userId = GetUserId();

        var item = await context.BookItems
            .FirstOrDefaultAsync(bi => bi.UserId == userId && bi.Id == id);

        if (item == null)
            return NotFound();

        context.BookItems.Remove(item);
        await context.SaveChangesAsync();
        return NoContent();
    }

    private static BookItemResponseDto MapToResponse(BookItem item) => new(
        item.Id,
        item.BookId,
        item.Book.Title,
        item.Book.CoverImageUrl,
        item.Condition,
        item.Status,
        item.Source,
        item.AcquiredDate,
        item.AcquiredPrice,
        item.EstimatedValue,
        item.Location != null ? $"Bookcase {item.Location.BookCase}, Shelf {item.Location.ShelfNumber}" : null,
        item.Notes,
        item.BookItemTags.Select(bt => bt.Tag.Name)
    );
}