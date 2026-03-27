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
public class ListingsController(BookTrackerDbContext context) : ControllerBase
{
    private string GetUserId() =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ListingResponseDto>>> GetListings()
    {
        var userId = GetUserId();

        var listings = await context.Listings
            .Where(l => l.BookItem.UserId == userId)
            .Include(l => l.BookItem)
                .ThenInclude(bi => bi.Book)
            .OrderBy(l => l.Status)
            .ThenByDescending(l => l.ListedDate)
            .ToListAsync();

        return Ok(listings.Select(MapToResponse));
    }

    [HttpGet("active")]
    public async Task<ActionResult<IEnumerable<ListingResponseDto>>> GetActiveListings()
    {
        var userId = GetUserId();

        var listings = await context.Listings
            .Where(l => l.BookItem.UserId == userId && l.Status == ListingStatus.Active)
            .Include(l => l.BookItem)
                .ThenInclude(bi => bi.Book)
            .OrderByDescending(l => l.ListedDate)
            .ToListAsync();

        return Ok(listings.Select(MapToResponse));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ListingResponseDto>> GetListing(Guid id)
    {
        var userId = GetUserId();

        var listing = await context.Listings
            .Where(l => l.BookItem.UserId == userId && l.Id == id)
            .Include(l => l.BookItem)
                .ThenInclude(bi => bi.Book)
            .FirstOrDefaultAsync();

        if (listing == null)
            return NotFound();

        return Ok(MapToResponse(listing));
    }

    [HttpPost]
    public async Task<ActionResult<ListingResponseDto>> CreateListing(
        [FromBody] CreateListingRequestDto request)
    {
        var userId = GetUserId();

        var bookItem = await context.BookItems
            .Include(bi => bi.Book)
            .Include(bi => bi.Listing)
            .FirstOrDefaultAsync(bi =>
                bi.UserId == userId && bi.Id == request.BookItemId);

        if (bookItem == null)
            return NotFound("Book item not found");

        if (bookItem.Status == BookStatus.Lent)
            return Conflict("Cannot list a book that is currently lent out");

        if (bookItem.Status == BookStatus.Sold)
            return Conflict("This book has already been sold");

        if (bookItem.Listing != null && bookItem.Listing.Status == ListingStatus.Active)
            return Conflict("This book already has an active listing");

        var listing = new Listing
        {
            Id = Guid.NewGuid(),
            BookItemId = request.BookItemId,
            AskingPrice = request.AskingPrice,
            ListedDate = request.ListedDate,
            Platform = request.Platform,
            Status = ListingStatus.Active,
            Description = request.Description
        };

        bookItem.Status = BookStatus.ForSale;

        context.Listings.Add(listing);
        await context.SaveChangesAsync();

        await context.Entry(listing).Reference(l => l.BookItem).LoadAsync();
        await context.Entry(listing.BookItem).Reference(bi => bi.Book).LoadAsync();

        return CreatedAtAction(nameof(GetListing),
            new { id = listing.Id }, MapToResponse(listing));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateListing(Guid id,
        [FromBody] UpdateListingRequestDto request)
    {
        var userId = GetUserId();

        var listing = await context.Listings
            .Include(l => l.BookItem)
            .FirstOrDefaultAsync(l =>
                l.Id == id && l.BookItem.UserId == userId);

        if (listing == null)
            return NotFound();

        if (listing.Status != ListingStatus.Active)
            return Conflict("Only active listings can be updated");

        listing.AskingPrice = request.AskingPrice;
        listing.Platform = request.Platform;
        listing.Description = request.Description;

        await context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("{id}/sold")]
    public async Task<IActionResult> MarkAsSold(Guid id,
        [FromBody] MarkSoldRequestDto request)
    {
        var userId = GetUserId();

        var listing = await context.Listings
            .Include(l => l.BookItem)
            .FirstOrDefaultAsync(l =>
                l.Id == id && l.BookItem.UserId == userId);

        if (listing == null)
            return NotFound();

        if (listing.Status != ListingStatus.Active)
            return Conflict("Only active listings can be marked as sold");

        listing.SoldPrice = request.SoldPrice;
        listing.SoldDate = request.SoldDate;
        listing.Status = ListingStatus.Sold;
        listing.BookItem.Status = BookStatus.Sold;

        await context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("{id}/cancel")]
    public async Task<IActionResult> CancelListing(Guid id)
    {
        var userId = GetUserId();

        var listing = await context.Listings
            .Include(l => l.BookItem)
            .FirstOrDefaultAsync(l =>
                l.Id == id && l.BookItem.UserId == userId);

        if (listing == null)
            return NotFound();

        if (listing.Status != ListingStatus.Active)
            return Conflict("Only active listings can be cancelled");

        listing.Status = ListingStatus.Cancelled;
        listing.BookItem.Status = BookStatus.InCollection;

        await context.SaveChangesAsync();
        return NoContent();
    }

    private static ListingResponseDto MapToResponse(Listing listing) => new(
        listing.Id,
        listing.BookItemId,
        listing.BookItem.Book.Title,
        listing.BookItem.Book.CoverImageUrl,
        listing.AskingPrice,
        listing.SoldPrice,
        listing.ListedDate,
        listing.SoldDate,
        listing.Platform,
        listing.Status,
        listing.Description
    );
}