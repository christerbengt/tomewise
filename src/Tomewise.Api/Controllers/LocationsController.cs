using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Tomewise.Api.Data;
using Tomewise.Api.Domain.Entities;
using Tomewise.Api.DTOs;

namespace Tomewise.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class LocationsController(BookTrackerDbContext context) : ControllerBase
{
    private string GetUserId() =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<LocationResponseDto>>> GetLocations()
    {
        var userId = GetUserId();

        var locations = await context.Locations
            .Where(l => l.UserId == userId)
            .Include(l => l.BookItems)
            .OrderBy(l => l.BookCase)
            .ThenBy(l => l.ShelfNumber)
            .ToListAsync();

        return Ok(locations.Select(MapToResponse));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<LocationResponseDto>> GetLocation(Guid id)
    {
        var userId = GetUserId();

        var location = await context.Locations
            .Where(l => l.UserId == userId && l.Id == id)
            .Include(l => l.BookItems)
            .FirstOrDefaultAsync();

        if (location == null)
            return NotFound();

        return Ok(MapToResponse(location));
    }

    [HttpPost]
    public async Task<ActionResult<LocationResponseDto>> CreateLocation(
        [FromBody] CreateLocationRequestDto request)
    {
        var userId = GetUserId();

        var existing = await context.Locations
            .FirstOrDefaultAsync(l =>
                l.UserId == userId &&
                l.BookCase == request.BookCase &&
                l.ShelfNumber == request.ShelfNumber);

        if (existing != null)
            return Conflict("A location with this bookcase and shelf number already exists");

        var location = new Location
        {
            Id = Guid.NewGuid(),
            BookCase = request.BookCase,
            ShelfNumber = request.ShelfNumber,
            CustomCode = request.CustomCode,
            Description = request.Description,
            UserId = userId
        };

        context.Locations.Add(location);
        await context.SaveChangesAsync();

        await context.Entry(location).Collection(l => l.BookItems).LoadAsync();

        return CreatedAtAction(nameof(GetLocation),
            new { id = location.Id }, MapToResponse(location));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateLocation(Guid id,
        [FromBody] UpdateLocationRequestDto request)
    {
        var userId = GetUserId();

        var location = await context.Locations
            .FirstOrDefaultAsync(l => l.UserId == userId && l.Id == id);

        if (location == null)
            return NotFound();

        var duplicate = await context.Locations
            .FirstOrDefaultAsync(l =>
                l.UserId == userId &&
                l.BookCase == request.BookCase &&
                l.ShelfNumber == request.ShelfNumber &&
                l.Id != id);

        if (duplicate != null)
            return Conflict("A location with this bookcase and shelf number already exists");

        location.BookCase = request.BookCase;
        location.ShelfNumber = request.ShelfNumber;
        location.CustomCode = request.CustomCode;
        location.Description = request.Description;

        await context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteLocation(Guid id)
    {
        var userId = GetUserId();

        var location = await context.Locations
            .Include(l => l.BookItems)
            .FirstOrDefaultAsync(l => l.UserId == userId && l.Id == id);

        if (location == null)
            return NotFound();

        if (location.BookItems.Any())
            return Conflict("Cannot delete a location that still has books on it");

        context.Locations.Remove(location);
        await context.SaveChangesAsync();
        return NoContent();
    }

    private static LocationResponseDto MapToResponse(Location location) => new(
        location.Id,
        location.BookCase,
        location.ShelfNumber,
        location.CustomCode,
        location.Description,
        location.BookItems.Count
    );
}