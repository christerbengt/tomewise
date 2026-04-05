using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Moq;
using Tomewise.Api.Domain.Entities;
using Tomewise.Api.Services;

namespace Tomewise.Api.Tests.Services;

public class TokenServiceTests
{
    private readonly TokenService _tokenService;
    private readonly Mock<UserManager<ApplicationUser>> _userManagerMock;

    public TokenServiceTests()
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Secret"] = "test-secret-key-that-is-long-enough-for-hmac",
                ["Jwt:Issuer"] = "tomewise-api",
                ["Jwt:Audience"] = "tomewise-client",
                ["Jwt:ExpiryHours"] = "24"
            })
            .Build();

        var store = new Mock<IUserStore<ApplicationUser>>();
        _userManagerMock = new Mock<UserManager<ApplicationUser>>(
            store.Object, null!, null!, null!, null!, null!, null!, null!, null!);

        _tokenService = new TokenService(configuration, _userManagerMock.Object);
    }

    [Fact]
    public async Task GenerateToken_ReturnsValidJwt()
    {
        var user = new ApplicationUser
        {
            Id = Guid.NewGuid().ToString(),
            Email = "test@tomewise.se",
            UserName = "test@tomewise.se"
        };

        _userManagerMock
            .Setup(m => m.GetRolesAsync(user))
            .ReturnsAsync([]);

        var token = await _tokenService.GenerateToken(user);

        Assert.NotNull(token);
        Assert.NotEmpty(token);

        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(token);

        Assert.Equal("tomewise-api", jwt.Issuer);
        Assert.Equal(user.Id, jwt.Subject);
        Assert.Equal(user.Email, jwt.Claims
            .First(c => c.Type == JwtRegisteredClaimNames.Email).Value);
    }

    [Fact]
    public async Task GenerateToken_IncludesAdminRole_WhenUserIsAdmin()
    {
        var user = new ApplicationUser
        {
            Id = Guid.NewGuid().ToString(),
            Email = "admin@tomewise.se",
            UserName = "admin@tomewise.se"
        };

        _userManagerMock
            .Setup(m => m.GetRolesAsync(user))
            .ReturnsAsync(["Admin"]);

        var token = await _tokenService.GenerateToken(user);

        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(token);

        var roleClaim = jwt.Claims
            .FirstOrDefault(c => c.Type == ClaimTypes.Role);

        Assert.NotNull(roleClaim);
        Assert.Equal("Admin", roleClaim.Value);
    }

    [Fact]
    public async Task GenerateToken_ExpiresIn24Hours()
    {
        var user = new ApplicationUser
        {
            Id = Guid.NewGuid().ToString(),
            Email = "test@tomewise.se",
            UserName = "test@tomewise.se"
        };

        _userManagerMock
            .Setup(m => m.GetRolesAsync(user))
            .ReturnsAsync([]);

        var token = await _tokenService.GenerateToken(user);

        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(token);

        var expectedExpiry = DateTime.UtcNow.AddHours(24);
        Assert.True(jwt.ValidTo > DateTime.UtcNow);
        Assert.True(jwt.ValidTo <= expectedExpiry.AddMinutes(1));
    }
}