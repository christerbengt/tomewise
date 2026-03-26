using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Tomewise.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomCodeToLocation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CustomCode",
                table: "Locations",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CustomCode",
                table: "Locations");
        }
    }
}
