# project-angular

Manage Stock Movements
User Story:
As a store admin, I want to update stock levels when inventory is received, transferred, or sold so that stock data remains accurate.
Technical Considerations:
API Endpoints:
POST /api/stock/movement (Add stock movement)
GET /api/stock/{id} (Get stock details per product)
Database Schema (Stock Movements Table):
MovementID (PK), ProductID (FK), MovementType (Inbound/Outbound), Quantity, SourceLocation, DestinationLocation, CreatedAt
Validation:
Ensure stock levels never go negative
Validate movement types (Inbound, Outbound, Transfer, Return)
Configure Cultures
User Story:
As an admin, I want to manage Country ISO Code so that I can use ISO Codes on Location selection.

Technical Considerations:

API Endpoint: POST /api/currencies
Database Schema (Cultures Table):
CultureID (PK), Name, Alpha2, Alpha3, UpdatedAt
Validation:
Fetch ISO Country codes from CultureInfo
 

Replenishment Management
User Story:
As an admin, I want to configure stock replenishment rules based on thresholds so that products are restocked efficiently.

Technical Considerations:

API Endpoint: POST /api/stock/replenishment
Database Schema (Replenishment Rules Table):
RuleID (PK), ProductID (FK), MinThreshold, MaxThreshold, ReorderQuantity, SupplierID (FK), CreatedAt
Business Rules:
Generate automatic reorder requests when stock falls below the MinThreshold
Send notifications for out-of-stock items











Minor correction in the requirement statement:

Present:

API Endpoint: POST /api/currencies

 

New:

API Endpoint: POST /api/cultures


1)CulturesController.cs:
using Microsoft.AspNetCore.Mvc;
using Pim.Core.Entities;
using Pim.Core.Services;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Pim.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CulturesController : ControllerBase
    {
        private readonly ICultureService _cultureService;

        public CulturesController(ICultureService cultureService)
        {
            _cultureService = cultureService;
        }

        [HttpGet]
        public async Task<IActionResult> GetCultures()
        {
            try
            {
                var cultures = await _cultureService.GetAllCulturesAsync();

                if (cultures == null || cultures.Count == 0)
                {
                    return NotFound("No cultures found.");
                }

                return Ok(cultures);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCultureById(int id)
        {
            try
            {
                var culture = await _cultureService.GetCultureByIdAsync(id);

                if (culture == null)
                {
                    return NotFound($"Culture with ID {id} not found.");
                }

                return Ok(culture);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}

2)ICulturesService.cs:

using Pim.Core.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Pim.Core.Services
{
    public interface ICultureService
    {
        Task<List<Cultures>> GetAllCulturesAsync();
        Task<Cultures>GetCultureByIdAsync(int id);
    }
}

3)CulturesService.cs:
using Pim.Core.Entities;
using Pim.Core.Repositories;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

namespace Pim.Core.Services
{
    public class CultureService : ICultureService
    {
        private readonly ICultureRepository _cultureRepository;

        // Constructor to inject the repository
        public CultureService(ICultureRepository cultureRepository)
        {
            _cultureRepository = cultureRepository;
        }

        // Get all cultures (from CultureInfo) and store them if they don't exist in the database
        public async Task<List<Cultures>> GetAllCulturesAsync()
        {
            var cultures = new List<Cultures>();

            // Fetch all available countries from CultureInfo
            var cultureInfos = CultureInfo.GetCultures(CultureTypes.SpecificCultures);

            foreach (var cultureInfo in cultureInfos)
            {
                var alpha2 = cultureInfo.Name.Substring(0, 2);  // Extract Alpha2 from culture name (en-US, de-DE, etc.)
                var alpha3 = new RegionInfo(cultureInfo.Name).ThreeLetterISORegionName; // Alpha3 code using RegionInfo

                // Check if the culture already exists in the database, if not create it
                var existingCulture = await _cultureRepository.GetCultureByAlphaCodesAsync(alpha2, alpha3);
                if (existingCulture == null)
                {
                    cultures.Add(new Cultures
                    {
                        Name = cultureInfo.DisplayName,
                        Alpha2 = alpha2.ToUpper(),
                        Alpha3 = alpha3.ToUpper(),
                        UpdatedAt = DateTime.UtcNow
                    });
                }
            }

            // Return list of cultures
            return cultures;
        }

        // Get culture by ID
        public async Task<Cultures> GetCultureByIdAsync(int id)
        {
            return await _cultureRepository.GetCultureByIdAsync(id);
        }
    }
}

4)ICulturesRepository.cs:

using Pim.Core.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Pim.Core.Repositories
{
    public interface ICultureRepository
    {
        Task<List<Cultures>> GetAllCulturesAsync();
        Task<Cultures> GetCultureByIdAsync(int id);
        Task<Cultures> GetCultureByAlphaCodesAsync(string alpha2, string alpha3); // Fetch by Alpha2 and Alpha3 codes
    }
}

5)CulturesRepository.cs:
using Pim.Core.Entities;
using Pim.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;
using Pim.Core.Repositories;

namespace Pim.Infrastructure.Repositories
{
    public class CultureRepository : ICultureRepository
    {
        private readonly PIMContext _context;

        // Constructor to inject the DbContext
        public CultureRepository(PIMContext context)
        {
            _context = context;
        }

        // Get all cultures
        public async Task<List<Cultures>> GetAllCulturesAsync()
        {
            return await _context.Cultures.ToListAsync();
        }

        // Get culture by ID
        public async Task<Cultures> GetCultureByIdAsync(int id)
        {
            return await _context.Cultures.FindAsync(id);
        }

        // Get culture by Alpha2 and Alpha3 codes
        public async Task<Cultures> GetCultureByAlphaCodesAsync(string alpha2, string alpha3)
        {
            return await _context.Cultures
                .FirstOrDefaultAsync(c => c.Alpha2 == alpha2 && c.Alpha3 == alpha3);
        }
    }
}


------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


1)ReplenishmentRule.cs:
using System;
using System.ComponentModel.DataAnnotations;
using Pim.Core.Entities.Base;

namespace Pim.Core.Entities
{
    public class ReplenishmentRule : Entity
    {
        public int ProductId { get; set; }

        public Product Product { get; set; }

        [Range(0, int.MaxValue)]
        public int MinThreshold { get; set; }

        [Range(0, int.MaxValue)]
        public int MaxThreshold { get; set; }

        [Range(0, int.MaxValue)]
        public int ReorderQuantity { get; set; }

        public int SupplierId { get; set; }

        public Supplier Supplier { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public static ReplenishmentRule Create(int ruleId, int productId, int minThreshold, int maxThreshold, int reorderQuantity, int supplierId, DateTime createdAt)
        {
            var replenishmentRule = new ReplenishmentRule
            {
                Id = ruleId,
                ProductId = productId,
                MinThreshold = minThreshold,
                MaxThreshold = maxThreshold,
                ReorderQuantity = reorderQuantity,
                SupplierId = supplierId,
                CreatedAt = createdAt,
            };
            return replenishmentRule;
        }
    }
}


2)ReplenishmentRuleDto.cs:
using System;
using Pim.Application.Models.Base;

namespace Pim.Application.Models
{
    public class ReplenishmentRuleDto : BaseModel
    {
        public int ProductId { get; set; }
        public int MinThreshold { get; set; }
        public int MaxThreshold { get; set; }
        public int ReorderQuantity { get; set; }
        public int SupplierId { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}


3)ReplenishmentRuleService.cs:
using Pim.Core.Entities;
using Pim.Core.Repositories;
using Pim.Application.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;
using Pim.Application.Interfaces;

namespace Pim.Application.Services
{
    public class ReplenishmentRuleService : IReplenishmentRuleService
    {
        private readonly IReplenishmentRuleRepository _replenishmentRuleRepository;

        public ReplenishmentRuleService(IReplenishmentRuleRepository replenishmentRuleRepository)
        {
            _replenishmentRuleRepository = replenishmentRuleRepository;
        }

        // Fetch all replenishment rules
        public async Task<List<ReplenishmentRuleDto>> GetAllReplenishmentRulesAsync()
        {
            var rules = await _replenishmentRuleRepository.GetAllReplenishmentRulesAsync();
            return rules.Select(rr => new ReplenishmentRuleDto
            {
                ProductId = rr.ProductId,
                MinThreshold = rr.MinThreshold,
                MaxThreshold = rr.MaxThreshold,
                ReorderQuantity = rr.ReorderQuantity,
                SupplierId = rr.SupplierId,
                CreatedAt = rr.CreatedAt
            }).ToList();
        }

        // Fetch replenishment rule for a specific product ID
        public async Task<ReplenishmentRuleDto> GetReplenishmentRuleByProductIdAsync(int productId)
        {
            var rule = await _replenishmentRuleRepository.GetReplenishmentRuleByProductIdAsync(productId);
            if (rule == null)
                return null;

            return new ReplenishmentRuleDto
            {
                ProductId = rule.ProductId,
                MinThreshold = rule.MinThreshold,
                MaxThreshold = rule.MaxThreshold,
                ReorderQuantity = rule.ReorderQuantity,
                SupplierId = rule.SupplierId,
                CreatedAt = rule.CreatedAt
            };
        }

        // Create a new replenishment rule
        public async Task<ReplenishmentRuleDto> CreateReplenishmentRuleAsync(ReplenishmentRuleDto replenishmentRuleDto)
        {
            var replenishmentRule = new ReplenishmentRule
            {
                ProductId = replenishmentRuleDto.ProductId,
                MinThreshold = replenishmentRuleDto.MinThreshold,
                MaxThreshold = replenishmentRuleDto.MaxThreshold,
                ReorderQuantity = replenishmentRuleDto.ReorderQuantity,
                SupplierId = replenishmentRuleDto.SupplierId,
                CreatedAt = DateTime.UtcNow
            };

            var createdRule = await _replenishmentRuleRepository.CreateReplenishmentRuleAsync(replenishmentRule);

            return new ReplenishmentRuleDto
            {
                ProductId = createdRule.ProductId,
                MinThreshold = createdRule.MinThreshold,
                MaxThreshold = createdRule.MaxThreshold,
                ReorderQuantity = createdRule.ReorderQuantity,
                SupplierId = createdRule.SupplierId,
                CreatedAt = createdRule.CreatedAt
            };
        }
    }
}

4)ReplenishmentRuleRepository.cs:

using Pim.Core.Entities;
using Pim.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Pim.Core.Repositories;
using Pim.Infrastructure.Repository.Base;

namespace Pim.Infrastructure.Repository
{
    public class ReplenishmentRuleRepository : Repository<ReplenishmentRule>, IReplenishmentRuleRepository
    {
        public ReplenishmentRuleRepository(PIMContext dbContext) : base(dbContext)
        {
        }

        // Get all replenishment rules
        public async Task<List<ReplenishmentRule>> GetAllReplenishmentRulesAsync()
        {
            return await _dbContext.ReplenishmentRule
                .Include(rr => rr.Product) // Load the related product details
                .Include(rr => rr.Supplier) // Load the related supplier details
                .ToListAsync();
        }

        // Get replenishment rule by product ID
        public async Task<ReplenishmentRule> GetReplenishmentRuleByProductIdAsync(int productId)
        {
            return await _dbContext.ReplenishmentRule
                .Include(rr => rr.Product)
                .Include(rr => rr.Supplier)
                .FirstOrDefaultAsync(rr => rr.ProductId == productId);
        }

        // Create a new replenishment rule
        public async Task<ReplenishmentRule> CreateReplenishmentRuleAsync(ReplenishmentRule replenishmentRule)
        {
            await _dbContext.ReplenishmentRule.AddAsync(replenishmentRule);
            await _dbContext.SaveChangesAsync();
            return replenishmentRule;
        }
    }
}

5)ReplenishmentRuleController.cs:
using Microsoft.AspNetCore.Mvc;
using Pim.Application.Interfaces;
using Pim.Application.Models;
using Pim.Application.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Pim.WebAPI.Controllers
{
    [Route("api/stock/replenishment")]
    [ApiController]
    public class ReplenishmentRuleController : ControllerBase
    {
        private readonly IReplenishmentRuleService _replenishmentRuleService;

        public ReplenishmentRuleController(IReplenishmentRuleService replenishmentRuleService)
        {
            _replenishmentRuleService = replenishmentRuleService;
        }

        // POST: api/stock/replenishment
        [HttpPost]
        public async Task<ActionResult<ReplenishmentRuleDto>> CreateReplenishmentRule([FromBody] ReplenishmentRuleDto replenishmentRuleDto)
        {
            var createdRule = await _replenishmentRuleService.CreateReplenishmentRuleAsync(replenishmentRuleDto);
            return CreatedAtAction(nameof(GetReplenishmentRuleByProductId), new { productId = createdRule.ProductId }, createdRule);
        }

        // GET: api/stock/replenishment
        [HttpGet]
        public async Task<ActionResult<List<ReplenishmentRuleDto>>> GetAllReplenishmentRules()
        {
            var rules = await _replenishmentRuleService.GetAllReplenishmentRulesAsync();
            return Ok(rules);
        }

        // GET: api/stock/replenishment/{productId}
        [HttpGet("{productId}")]
        public async Task<ActionResult<ReplenishmentRuleDto>> GetReplenishmentRuleByProductId(int productId)
        {
            var rule = await _replenishmentRuleService.GetReplenishmentRuleByProductIdAsync(productId);
            if (rule == null)
            {
                return NotFound();
            }
            return Ok(rule);
        }
    }
}



using Pim.Application.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Pim.Application.Interfaces
{
    public interface IReplenishmentRuleService
    {
        Task<List<ReplenishmentRuleDto>> GetAllReplenishmentRulesAsync();
        Task<ReplenishmentRuleDto> GetReplenishmentRuleByProductIdAsync(int productId);
        Task<ReplenishmentRuleDto> CreateReplenishmentRuleAsync(ReplenishmentRuleDto replenishmentRuleDto);
    }
}











using Pim.Core.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Pim.Core.Repositories
{
    public interface IReplenishmentRuleRepository
    {
        Task<List<ReplenishmentRule>> GetAllReplenishmentRulesAsync();
        Task<ReplenishmentRule> GetReplenishmentRuleByProductIdAsync(int productId);
        Task<ReplenishmentRule> CreateReplenishmentRuleAsync(ReplenishmentRule replenishmentRule);
    }
}











using Pim.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System.Collections.Generic;
using Pim.Core.Enums;
using System.Threading.Tasks;
using System.Threading;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using System.Reflection.Emit;

namespace Pim.Infrastructure.Data
{
    public class PIMContext : DbContext
    {

        private readonly IHttpContextAccessor _httpContextAccessor;
        public PIMContext(DbContextOptions options, IHttpContextAccessor httpContextAccessor) : base(options)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public DbSet<Product> Products { get; set; }
        public DbSet<ProductImage> ProductImages { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<ReplenishmentRule> ReplenishmentRule { get; set; }
        public DbSet<Supplier> Suppliers { get; set; }
        public DbSet<Audit> AuditLogs { get; set; }
        public DbSet<Cultures> Cultures { get; set; }
        public DbSet<TaxRule> TaxRules { get; set; }
        public DbSet<Currency> Currencies { get; set; }

        public DbSet<StockMovement> StockMovements { get; set; }
        public DbSet<ProductStock> ProductStocks { get; set; }
        protected override void OnModelCreating(ModelBuilder builder)
        {
            builder.Entity<Currency>()
               .Property(c => c.Rate)
               .HasColumnType("decimal(18, 2)");

            builder.Entity<Product>()
                .Property(p => p.Price)
                .HasColumnType("decimal(18, 2)");

            builder.Entity<Product>(ConfigureProduct);
            builder.Entity<Supplier>(ConfigureSupplier);
            builder.Entity<Category>(ConfigureCategory);
            builder.Entity<TaxRule>(ConfigureTaxRule);
            builder.Entity<Cultures>(ConfigureCultures);
            builder.Entity<ProductStock>(ConfigureProductStock);
            builder.Entity<StockMovement>()
                 .Property(s => s.StockMovementType)
                 .HasConversion<string>();
            builder.Entity<ReplenishmentRule>(ConfigureReplenishmentRule);
            base.OnModelCreating(builder);
        }

        private void ConfigureProductStock(EntityTypeBuilder<ProductStock> builder)
        {
            builder.ToTable("ProductStock");

            builder.HasKey(ps => ps.Id);

            builder.Property(ps => ps.Quantity)
                   .IsRequired();

            builder.Property(ps => ps.LastUpdatedAt)
                   .IsRequired();

            builder.HasOne(ps => ps.Product)
                   .WithOne(p => p.ProductStock)
                   .HasForeignKey<ProductStock>(ps => ps.ProductId)
                   .OnDelete(DeleteBehavior.Cascade);
        }

        private void ConfigureCultures(EntityTypeBuilder<Cultures> builder)
        {
            builder.ToTable("Cultures");

            builder.HasKey(c => c.Id);

            builder.Property(c => c.Name)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(c => c.Alpha2)
                .IsRequired()
                .HasMaxLength(2);

            builder.Property(c => c.Alpha3)
                .IsRequired()
                .HasMaxLength(3);

            builder.Property(c => c.UpdatedAt)
                .HasDefaultValueSql("GETUTCDATE()");
        }

        private void ConfigureReplenishmentRule(EntityTypeBuilder<ReplenishmentRule> builder)
        {
            builder.ToTable("ReplenishmentRule");

            builder.HasKey(r => r.Id);

            builder.Property(r => r.ProductId)
                .IsRequired();

            builder.Property(r => r.MinThreshold)
                .IsRequired();

            builder.Property(r => r.MaxThreshold)
                .IsRequired();

            builder.Property(r => r.ReorderQuantity)
                .IsRequired();

            builder.Property(r => r.SupplierId)
                .IsRequired();

            builder.Property(r => r.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            builder.HasOne(r => r.Product)
                .WithMany()
                .HasForeignKey(r => r.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(r => r.Supplier)
                .WithMany()
                .HasForeignKey(r => r.SupplierId)
                .OnDelete(DeleteBehavior.Restrict);
        }

        //New changes by me are applied below
        private void ConfigureCategory(EntityTypeBuilder<Category> builder)
        {
            builder.ToTable("Categories");

            builder.HasKey(c => c.Id);

            builder.Property(c => c.CategoryName)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(c => c.UpdatedAt)
                .HasDefaultValueSql("GETUTCDATE()");
        }

        private void ConfigureTaxRule(EntityTypeBuilder<TaxRule> builder)
        {
            builder.ToTable("TaxRule");

            builder.HasKey(t => t.RulesId);

            builder.Property(t => t.Region)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(t => t.TaxPercentage)
                .HasColumnType("decimal(18, 2)");

            builder.HasOne(t => t.Category)
            .WithMany()
            .HasForeignKey(t => t.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

            builder.Property(t => t.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(t => t.UpdatedAt)
                .HasDefaultValueSql("GETUTCDATE()");
        }
        //Completed over here


        private void ConfigureProduct(EntityTypeBuilder<Product> builder)
        {
            builder.ToTable("Products");

            builder.HasKey(p => p.Id);

            builder.Property(p => p.ProductName)
                .IsRequired()
                .HasMaxLength(100);

            builder.HasIndex(p => p.SKU)
                .IsUnique();

            builder.HasOne(p => p.Category)
                .WithMany()
                .HasForeignKey(p => p.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Property(p => p.Currency)
                .HasDefaultValue("INR");

            builder.HasMany(p => p.ProductImages)
            .WithOne(pi => pi.Product)
            .HasForeignKey(pi => pi.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(p => p.StockMovements)
            .WithOne(sm => sm.Product)
            .HasForeignKey(sm => sm.ProductId)
            .OnDelete(DeleteBehavior.Cascade);
        }

        private void ConfigureProductImage(EntityTypeBuilder<ProductImage> builder)
        {
            builder.ToTable("ProductImage");
            builder.ToTable("ProductImage");

            builder.HasKey(pi => pi.Id);

            builder.Property(pi => pi.ImageUrl)
                .IsRequired()
                .HasMaxLength(200);
        }

        private void ConfigureSupplier(EntityTypeBuilder<Supplier> builder)
        {
            builder.ToTable("Supplier");
            builder.HasKey(ci => ci.Id);
            builder.Property(cb => cb.SupplierName)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(cb => cb.Country)
                .IsRequired()
                .HasMaxLength(150);

            builder.Property(cb => cb.ContactInfo)
                .IsRequired()
                .HasMaxLength(15);
        }

        private void BeforeSaveChanges()
        {
            ChangeTracker.DetectChanges();
            var auditEntries = new List<AuditEntry>();
            var userId = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "Unknown";
            //string userId = user != null ? user.Value : null;
            foreach (var entry in ChangeTracker.Entries())
            {
                if (entry.Entity is Audit || entry.State == EntityState.Detached || entry.State == EntityState.Unchanged)
                    continue;
                var auditEntry = new AuditEntry(entry);
                auditEntry.TableName = entry.Entity.GetType().Name;
                auditEntries.Add(auditEntry);
                foreach (var property in entry.Properties)
                {
                    string propertyName = property.Metadata.Name;
                    if (property.Metadata.IsPrimaryKey())
                    {
                        auditEntry.KeyValues[propertyName] = property.CurrentValue;
                        continue;
                    }
                    switch (entry.State)
                    {
                        case EntityState.Added:
                            auditEntry.AuditType = AuditType.Create;
                            auditEntry.NewValues[propertyName] = property.CurrentValue;
                            // auditEntry.UserId = entry.Property("CreatedBy").CurrentValue != null ? entry.Property("CreatedBy").CurrentValue.ToString() : "Null";
                            auditEntry.UserId = userId;
                            break;
                        case EntityState.Deleted:
                            auditEntry.AuditType = AuditType.Delete;
                            auditEntry.OldValues[propertyName] = property.OriginalValue;
                            // auditEntry.UserId = entry.Property("LastModifiedBy").CurrentValue != null ? entry.Property("LastModifiedBy").CurrentValue.ToString() : "Null";
                            auditEntry.UserId = userId;
                            break;
                        case EntityState.Modified:
                            if (property.IsModified)
                            {
                                auditEntry.ChangedColumns.Add(propertyName);
                                auditEntry.AuditType = AuditType.Update;
                                auditEntry.OldValues[propertyName] = property.OriginalValue;
                                auditEntry.NewValues[propertyName] = property.CurrentValue;
                                // auditEntry.UserId = entry.Property("LastModifiedBy").CurrentValue != null ? entry.Property("LastModifiedBy").CurrentValue.ToString() : "Null";
                                auditEntry.UserId = userId;
                            }
                            break;
                    }
                }
            }
            foreach (var auditEntry in auditEntries)
            {
                AuditLogs.Add(auditEntry.ToAudit());
            }
        }

        public override int SaveChanges()
        {
            BeforeSaveChanges();
            return base.SaveChanges();
        }

        public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default)
        {
            BeforeSaveChanges();
            return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
        }
    }
}







using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Pim.Application.Models;
using Pim.Core.Entities;

namespace Pim.Application.Interfaces
{
    public interface IStockMovementService
    {
        Task<bool> AddStockMovementAsync(StockMovementDto dto);
        Task<IEnumerable<StockMovement>> GetStockMovementByProductIdAsync(int id);
        Task<IEnumerable<StockMovement>> GetStockMovementsByProductNameAsync(string productName);
        Task<IEnumerable<StockMovement>> GetStockMovementsAsync();
    }
}






using System;
using System.ComponentModel.DataAnnotations;
using Pim.Core.Enums;

namespace Pim.Application.Models
{
    public class StockMovementDto
    {
        [Required]
        public int ProductId { get; set; }

        [Required]
        public StockMovementType StockMovementType { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be greater than 0.")]
        public int Quantity { get; set; }

        public string? SourceLocation { get; set; }
        public string? DestinationLocation { get; set; }
    }
}






using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Pim.Core.Entities;
using Pim.Core.Interfaces;
using Pim.Core.Repositories;
using Pim.Application.Mapper;
using Pim.Application.Interfaces;
using Pim.Application.Models;
using System.Linq;
using Pim.Core.Enums;

namespace Pim.Application.Services
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _productRepository;
        //private readonly IStockMovementRepository _stockMovementRepository;
        private readonly IAppLogger<ProductService> _logger;

        public ProductService(IProductRepository productRepository, IAppLogger<ProductService> logger)
        {
            //_stockMovementRepository = stockMovementRepository;
            _productRepository = productRepository ?? throw new ArgumentNullException(nameof(productRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<bool> IsSkuUniqueAsync(string sku)
        {
            return await _productRepository.IsSkuUniqueAsync(sku);
        }

        public async Task<string> AddProductAsync(ProductDto productCreateDTO)
        {
            if (string.IsNullOrEmpty(productCreateDTO.ProductName))
            {
                return "Product name is required.";
            }

            if (productCreateDTO.ProductName.Length > 100)
            {
                return "Product name cannot exceed 100 characters.";
            }

            if (string.IsNullOrEmpty(productCreateDTO.SKU))
            {
                return "SKU is required.";
            }

            if (productCreateDTO.Price <= 0)
            {
                return "Price must be greater than zero.";
            }

            bool isSkuUnique = await IsSkuUniqueAsync(productCreateDTO.SKU);
            if (!isSkuUnique)
            {
                return "SKU already exists!";
            }

            var product = new Product
            {
                ProductName = productCreateDTO.ProductName,
                Description = productCreateDTO.Description,
                SKU = productCreateDTO.SKU,
                CategoryId = productCreateDTO.CategoryId,
                //StockQuantity = productCreateDTO.StockQuantity,
                Price = productCreateDTO.Price,
                Currency = "INR",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var addedProduct = await _productRepository.AddAsync(product);

            var productStock = new ProductStock
            {
                ProductId = addedProduct.Id,
                //Quantity = addedProduct.StockQuantity,
                LastUpdatedAt = DateTime.UtcNow
            };
            await _productRepository.AddProductStockAsync(productStock);

            //if (product.StockQuantity > 0)
            //{
            //    var stockMovement = StockMovement.Create(productId: product.Id,
            //        stockMovementType: StockMovementType.Inbound,
            //        quantity: product.StockQuantity,
            //        sourceLocation: null,
            //        destinationLocation: "Initial Add"
            //    );
            //    await _stockMovementRepository.AddStockMovementAsync(stockMovement);
            //}

            return string.IsNullOrWhiteSpace(addedProduct?.SKU) ? "Failed to add the product." : string.Empty;  
        }

        public async Task<IEnumerable<ProductDto>> GetAllProductsAsync()
        {
            var products = await _productRepository.GetAllAsync();

            var productDTOs = products.Select(p => new ProductDto
            {
                Id = p.Id,
                ProductName = p.ProductName,
                Description = p.Description,
                SKU = p.SKU,
                CategoryId = p.CategoryId,
                //StockQuantity = p.StockQuantity,
                Price = p.Price,
                Currency = p.Currency,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });

            return productDTOs;
        }
    }
}







using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Pim.Application.Interfaces;
using Pim.Application.Models;
using Pim.Core.Entities;
using Pim.Core.Enums;
using Pim.Core.Repositories;

namespace Pim.Application.Services
{
    public class StockMovementService : IStockMovementService
    {
        private readonly IStockMovementRepository _stockMovementRepository;
        private readonly IProductRepository _productRepository;

        public StockMovementService(
            IStockMovementRepository movementRepository,
            IProductRepository productRepository)
        {
            _stockMovementRepository = movementRepository;
            _productRepository = productRepository;
        }

        public async Task<bool> AddStockMovementAsync(StockMovementDto dto)
        {
            try
            {
                ValidateStockMovement(dto);

                var product = await _productRepository.GetByIdAsync(dto.ProductId);
                if (product is null)
                    return false;

                var productStock = await _productRepository.GetProductStockAsync(dto.ProductId);
                if (productStock is null)
                    return false;

                switch (dto.StockMovementType)
                {
                    case StockMovementType.Inbound:
                    case StockMovementType.Return:
                        //product.StockQuantity += dto.Quantity;
                        productStock.Quantity += dto.Quantity;
                        break;

                    case StockMovementType.Outbound:
                        if (productStock.Quantity < dto.Quantity)
                            return false;
                        //product.StockQuantity -= dto.Quantity;
                        productStock.Quantity -= dto.Quantity;
                        break;

                    case StockMovementType.Transfer:
                        if (productStock.Quantity < dto.Quantity)
                            return false;
                        break;
                }
                productStock.LastUpdatedAt = DateTime.UtcNow;

                var stockMovement = StockMovement.Create(
                    dto.ProductId,
                    dto.StockMovementType,
                    dto.Quantity,
                    dto.SourceLocation,
                    dto.DestinationLocation
                );

                await _stockMovementRepository.AddStockMovementAsync(stockMovement);
                //await _productRepository.UpdateAsync(product);
                await _productRepository.UpdateProductStockAsync(productStock);

                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<IEnumerable<StockMovement>> GetStockMovementsAsync()
        {
            return await _stockMovementRepository.GetStockMovementsAsync();
        }

        public async Task<IEnumerable<StockMovement>> GetStockMovementByProductIdAsync(int id)
        {
            return await _stockMovementRepository.GetStockMovementByProductIdAsync(id);
        }

        public async Task<IEnumerable<StockMovement>> GetStockMovementsByProductNameAsync(string productName)
        {
            return await _stockMovementRepository.GetStockMovementByProductNameAsync(productName);
        }

        private void ValidateStockMovement(StockMovementDto dto)
        {

            dto.SourceLocation = dto.SourceLocation?.Trim().ToLowerInvariant();
            dto.DestinationLocation = dto.DestinationLocation?.Trim().ToLowerInvariant();

            if (dto.Quantity <= 0)
                throw new ArgumentException("Quantity must be greater than zero.");

            switch (dto.StockMovementType)
            {
                case StockMovementType.Inbound:
                    if (string.IsNullOrWhiteSpace(dto.DestinationLocation))
                        throw new ArgumentException("Inbound requires a destination location.");
                    break;

                case StockMovementType.Outbound:
                    if (string.IsNullOrWhiteSpace(dto.SourceLocation))
                        throw new ArgumentException("Outbound requires a source location.");
                    break;

                case StockMovementType.Transfer:
                case StockMovementType.Return:
                    if (string.IsNullOrWhiteSpace(dto.SourceLocation) || string.IsNullOrWhiteSpace(dto.DestinationLocation))
                        throw new ArgumentException($"{dto.StockMovementType} requires both source and destination locations.");
                    break;

                default:
                    throw new ArgumentException("Invalid stock movement type.");
            }
        }
    }
}








ProductStock.cs:using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Pim.Core.Entities.Base;

namespace Pim.Core.Entities
{
    public class ProductStock : Entity
    {
        [Required]
        [ForeignKey("Product")]
        public int ProductId { get; set; }

        public Product Product { get; set; }

        [Required]
        public int Quantity { get; set; }

        [Required]
        public DateTime LastUpdatedAt { get; set; }
    }
}





stockmovement.cs:using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Pim.Core.Entities.Base;
using Pim.Core.Enums;

namespace Pim.Core.Entities
{
    public class StockMovement : Entity
    {
        public StockMovement() { }

        [Required]
        [ForeignKey("Product")]
        public int ProductId { get; set; }

        [Required]
        public StockMovementType StockMovementType { get; set; }
        
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be greater than 0.")]
        public int Quantity { get; set; }

        public string? SourceLocation { get; set; }
        public string? DestinationLocation { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // navigation property
        public Product? Product;

        public static StockMovement Create(int productId, StockMovementType stockMovementType, int quantity, string? sourceLocation, string? destinationLocation)
        {
            var stockMovement = new StockMovement
            {
                ProductId = productId,
                StockMovementType = stockMovementType,
                Quantity = quantity,
                SourceLocation = sourceLocation,
                DestinationLocation = destinationLocation,
                CreatedAt = DateTime.UtcNow
            };
            return stockMovement;
        }
    }
}













using Pim.Core.Entities;
using Pim.Core.Repositories.Base;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Pim.Core.Repositories
{
    public interface IProductRepository : IRepository<Product>
    {
         Task<Product> AddAsync(Product product);
        Task<IEnumerable<Product>> GetAllAsync();
        Task<bool> IsSkuUniqueAsync(string sku); 
        Task<bool> SaveAsync();

        Task AddProductStockAsync(ProductStock stock);
        Task<ProductStock?> GetProductStockAsync(int productId);
        Task UpdateProductStockAsync(ProductStock stock);
    }
}

















using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Pim.Core.Entities;
using Pim.Core.Repositories.Base;

namespace Pim.Core.Repositories
{
    public interface IStockMovementRepository : IRepository<StockMovement>
    {
        Task AddStockMovementAsync(StockMovement stockMovement);
        Task<IEnumerable<StockMovement>> GetStockMovementByProductNameAsync(string productName);
        Task<IEnumerable<StockMovement>> GetStockMovementByProductIdAsync(int id);
        Task<IEnumerable<StockMovement>> GetStockMovementsAsync();
    }
}














using Pim.Core.Entities;
using Pim.Core.Repositories;
using Pim.Core.Specifications;
using Pim.Infrastructure.Data;
using Pim.Infrastructure.Repository.Base;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Pim.Infrastructure.Repository
{
    public class ProductRepository : Repository<Product>, IProductRepository
    {
        public ProductRepository(PIMContext dbContext) : base(dbContext)
        {
        }

        public async Task<Product> AddAsync(Product product)
        {
            await _dbContext.Products.AddAsync(product);
            await _dbContext.SaveChangesAsync();
            return product;
        }

        public async Task<IEnumerable<Product>> GetAllAsync()
        {
            return await _dbContext.Products.ToListAsync();
        }

        public async Task<bool> IsSkuUniqueAsync(string sku)
        {
            return !await _dbContext.Products.AnyAsync(p => p.SKU == sku);
        }

        public async Task<bool> SaveAsync()
        {
            var saved = await _dbContext.SaveChangesAsync();
            return saved > 0;
        }

        public async Task AddProductStockAsync(ProductStock stock)
        {
            await _dbContext.ProductStocks.AddAsync(stock);
            await _dbContext.SaveChangesAsync();
        }

        public async Task<ProductStock?> GetProductStockAsync(int productId)
        {
            return await _dbContext.ProductStocks
            .FirstOrDefaultAsync(ps => ps.ProductId == productId);
        }

        public async Task UpdateProductStockAsync(ProductStock stock)
        {
            _dbContext.ProductStocks.Update(stock);
            await _dbContext.SaveChangesAsync();
        }
    }
}
















using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Pim.Core.Entities;
using Pim.Core.Repositories;
using Pim.Infrastructure.Data;
using Pim.Infrastructure.Repository.Base;

namespace Pim.Infrastructure.Repository
{
    public class StockMovementRepository : Repository<StockMovement>, IStockMovementRepository
    {
        private readonly PIMContext _context;
        public StockMovementRepository(PIMContext dbContext) : base(dbContext)
        {
            _context = dbContext;
        }

        public async Task AddStockMovementAsync(StockMovement stockMovement)
        {
            try
            {
                await _context.StockMovements.AddAsync(stockMovement);
                await _context.SaveChangesAsync();
            }
            catch(Exception e)
            {
                throw new Exception("An error occurred while adding the stock movement.", e);
            }
        }

        public async Task<IEnumerable<StockMovement>> GetStockMovementsAsync()
        {
            try
            {
                return await _context.StockMovements.ToListAsync();
            }
            catch (Exception e)
            {
                throw new Exception("An error occurred while fetching the stock movements.", e);
            }
        }

        public async Task<IEnumerable<StockMovement>> GetStockMovementByProductIdAsync(int id)
        {
            try
            {
                return await _context.StockMovements
                .Include(sm => sm.Product)
                .Where(sm => sm.Product.Id == id)
                .ToListAsync();
            }
            catch (Exception e)
            {
                throw new Exception("An error occurred while fetching the stock movement from product id.", e);
            }
        }

        public async Task<IEnumerable<StockMovement>> GetStockMovementByProductNameAsync(string productName)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(productName))
                    return Enumerable.Empty<StockMovement>();

                var normalizedName = productName.Trim().ToLower();

                return await _context.StockMovements
                    .Where(sm => sm.Product != null && sm.Product.ProductName.ToLower().Trim() == normalizedName)
                    .ToListAsync();
            }
            catch (Exception e)
            {
                throw new Exception("An error occurred while fetching the stock movement from product name.", e);
            }
        }
    }
}












using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pim.Application.Interfaces;
using Pim.Application.Models;
using Pim.WebAPI.Filters;

namespace Pim.WebAPI.Controllers
{
    [ApiController]
    [Route("api/products")]
    public class ProductController : ControllerBase
    {
        private readonly ILogger<ProductController> _logger;
        private readonly IProductService _productService;

        public ProductController(ILogger<ProductController> logger,
            IProductService productService)
        {
            _productService = productService;
            _logger = logger;
        }

        [HttpGet]
        [PimAuthorize("admin", "user")]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetAllProducts()
        {
            try
            {
                var products = await _productService.GetAllProductsAsync();

                return Ok(products);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        [PimAuthorize("admin")]
        public async Task<ActionResult> CreateProduct([FromBody] ProductDto productCreateDTO)
        {
            if (productCreateDTO == null)
            {
                return BadRequest("Product data is invalid.");
            }

            try
            {
                bool isSkuUnique = await _productService.IsSkuUniqueAsync(productCreateDTO.SKU);
                if (!isSkuUnique)
                {
                    return Conflict(new { message = "SKU already exists." });
                }

                string resultMessage = await _productService.AddProductAsync(productCreateDTO);

                if (string.IsNullOrEmpty(resultMessage))
                {
                    return CreatedAtAction(nameof(GetAllProducts), new { id = productCreateDTO.SKU }, productCreateDTO);
                }

                return BadRequest(resultMessage);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}

















using Microsoft.AspNetCore.Mvc;
using Pim.Application.Interfaces;
using Pim.Application.Models;
using Pim.Core.Entities;

namespace Pim.WebAPI.Controllers
{
    [ApiController]
    [Route("api/stock")]
    public class StockController : ControllerBase
    {
        private readonly IStockMovementService _stockMovementService;
        public StockController(IStockMovementService stockMovementService)
        {
            _stockMovementService = stockMovementService;
        }

        [HttpGet]
        public async Task<IActionResult> GetStockMovementsAsync()
        {
            try
            {
                var result = await _stockMovementService.GetStockMovementsAsync();
                if (result is null)
                {
                    return NotFound("Stock movements not found.");
                }
                return Ok(result);
            }
            catch (Exception e)
            {
                return BadRequest(new { message = $"Error during fetching all stock movements: {e.Message}" });
            }
        }


        [HttpPost("movement")]
        public async Task<IActionResult> AddStockMovementAsync([FromBody] StockMovementDto stockMovementDto)
        {
            try
            {
                var result = await _stockMovementService.AddStockMovementAsync(stockMovementDto);
                if (result == false)
                {
                    return BadRequest("Failed to add stock movement.");
                }
                return Ok("Stock movement added successfully.");
            }
            catch (Exception e)
            {
                return BadRequest(new { message = $"Error during adding stock movements: {e.Message}" });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetStockMovementByIdAsync(int id)
        {
            try
            {
                var stockMovement = await _stockMovementService.GetStockMovementByProductIdAsync(id);
                if (stockMovement is null)
                {
                    return NotFound("Stock movement not found.");
                }
                return Ok(stockMovement);
            }
            catch (Exception e)
            {
                return BadRequest(new { message = $"Error during fetching stock movements from product id : {e.Message}" });
            }
        }

        [HttpGet("search")]
        public async Task<IActionResult> GetStockMovementsByProductNameAsync([FromQuery] string productName)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(productName))
                {
                    return BadRequest("Product name is required.");
                }

                var stockMovements = await _stockMovementService.GetStockMovementsByProductNameAsync(productName);
                if (stockMovements is null)
                {
                    return NotFound("No stock movements found.");
                }
                return Ok(stockMovements);
            }
            catch (Exception e)
            {
                return BadRequest(new { message = $"Error during fetching stock movements from product name : {e.Message}" });
            }
        }
    }
}




------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


add-stock-movement:

<app-layout-header></app-layout-header>
<div class="container mt-4">
    <h2 class="mb-4 text-center">Add Stock Movement</h2>
    <form #stockForm="ngForm" (ngSubmit)="submitForm(stockForm)" novalidate class="w-50 mx-auto">

      <div class="mb-3">
        <label for="productId" class="form-label">Product</label>
        <select
          id="productId"
          name="productId"
          class="form-select"
          [(ngModel)]="movement.productId"
          #productId="ngModel"
          required
        >
          <option [ngValue]="null" disabled selected>Select Product</option>
          <option *ngFor="let product of products" [ngValue]="product.id">
            {{ product.productName }}
          </option>
        </select>
        <div class="text-danger" *ngIf="productId.invalid && productId.touched">
          Product is required.
        </div>
      </div>
    
        <div class="mb-3">
          <label for="stockMovementType" class="form-label">Movement Type</label>
          <select
            id="stockMovementType"
            name="stockMovementType"
            class="form-select"
            [(ngModel)]="movement.stockMovementType"
            #movementType="ngModel"
            required
          >
            <option [ngValue]="null" disabled>Select Type</option>
            <option *ngFor="let type of movementTypes" [ngValue]="type.value">
              {{ type.label }}
            </option>
          </select>
          <div class="text-danger" *ngIf="movementType.invalid && movementType.touched">
            Movement type is required.
          </div>
        </div>
      
        <div class="mb-3">
          <label for="quantity" class="form-label">Quantity</label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            class="form-control"
            [(ngModel)]="movement.quantity"
            #quantity="ngModel"
            required
            min="1"
          />
          <div class="text-danger" *ngIf="quantity.errors?.['required'] && quantity.touched">
            Quantity is required.
          </div>
          <div class="text-danger" *ngIf="quantity.errors?.['min'] && quantity.touched">
            Quantity must be at least 1.
          </div>
        </div>
      
        <div class="mb-3">
          <label for="sourceLocation" class="form-label">Source Location</label>
          <select
            id="sourceLocation"
            name="sourceLocation"
            class="form-select"
            [(ngModel)]="movement.sourceLocation"
            [required]="isSourceRequired()"
            #srcLoc="ngModel"
          >
            <option [ngValue]="null" disabled selected>Select Source</option>
            <option *ngFor="let loc of locations" [ngValue]="loc">{{ loc }}</option>
          </select>
          <div class="text-danger" *ngIf="srcLoc.invalid && srcLoc.touched">
            Source location is required for this movement type.
          </div>
        </div>

        <div class="mb-3">
          <label for="destinationLocation" class="form-label">Destination Location</label>
          <select
            id="destinationLocation"
            name="destinationLocation"
            class="form-select"
            [(ngModel)]="movement.destinationLocation"
            [required]="isDestinationRequired()"
            #destLoc="ngModel"
          >
            <option [ngValue]="null" disabled selected>Select Destination</option>
            <option *ngFor="let loc of locations" [ngValue]="loc">{{ loc }}</option>
          </select>
          <div class="text-danger" *ngIf="destLoc.invalid && destLoc.touched">
            Destination location is required for this movement type.
          </div>
        </div>
      
        <button type="submit" class="btn btn-primary" [disabled]="stockForm.invalid">
          Submit
        </button>

        <div class="text-danger mt-2" *ngIf="serverError">
          {{ serverError }}
        </div>
      </form>     
</div>

add-stock-moment.ts:
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Culture } from '@models/cultures';
import { Product } from '@models/product';
import { StockMovement } from '@models/stock-movement.model';
import { CultureService } from '@services/cultures.service';
import { ProductService } from '@services/product.service';
import { StockService } from '@services/stock.service';

@Component({
  selector: 'app-add-stock-movement',
  templateUrl: './add-stock-movement.component.html',
})
export class AddStockMovementComponent {
  movement = {
    productId: 0,
    stockMovementType: 0,
    quantity: 0,
    sourceLocation: '',
    destinationLocation: ''
  };

  locations: string[] = []; 
  products: Product[] = [];
  
  movementTypes = [
    { value: 1, label: 'Inbound' },
    { value: 2, label: 'Outbound' },
    { value: 3, label: 'Transfer' },
    { value: 4, label: 'Return' }
  ];

  serverError: string | null = null;

  constructor(
    private stockService: StockService,
    private cultureService: CultureService,
    private productService: ProductService,
    private router: Router
  ) {
    this.loadLocations();
    this.loadProducts();
  }

  loadLocations() {
    this.cultureService.getCultures().subscribe({
      next: (cultures: Culture[]) => {
        this.locations = cultures
          .map(c => c.alpha2)
          .filter(code => !!code);
      },
      error: (err) => {
        console.error('Failed to load locations', err);
      }
    });
  }

  loadProducts(): void {
    this.productService.getProduct().subscribe({
      next: (res) => this.products = res,
      error: (err) => {
        console.error('Failed to load products', err);
        this.serverError = 'Unable to load products';
      }
    });
  }

  isSourceRequired(): boolean {
    return this.movement.stockMovementType === 2 ||
           this.movement.stockMovementType === 3 ||
           this.movement.stockMovementType === 4; 
  }
  
  isDestinationRequired(): boolean {
    return this.movement.stockMovementType === 1 || 
           this.movement.stockMovementType === 3 || 
           this.movement.stockMovementType === 4;   
  }

  submitForm(form: any): void {
    if (form.invalid) return;

    this.serverError = null;

    const payload : StockMovement = {
      productId: this.movement.productId,
      stockMovementType: this.movement.stockMovementType,
      quantity: this.movement.quantity,
      sourceLocation: this.movement.sourceLocation,
      destinationLocation: this.movement.destinationLocation,
    };

    this.stockService.addStockMovement(payload).subscribe({
      next: () => this.router.navigate(['/stock']),
      error: (err) => {
        console.error('Failed to add stock movement', err);
        this.serverError =
          err?.error?.title ||
          'Something went wrong. Please check your inputs and try again.';
      }
    });
  }
}



stock-list.component.html:

<app-layout-header></app-layout-header>

<div class="container mt-4">
    <div  class="d-flex justify-content-between align-items-center mb-3">
        <h2>Stock Movements</h2>
        <button (click)="openAddStockMovementForm()" class="btn btn-primary">Add Stock Movement</button>
    </div>

    <div class="mb-3">
      <input type="text" class="form-control" placeholder="Search by Product ID or Location" [(ngModel)]="search">
    </div>
  
    <div class="table-responsive" style="max-height: 500px; overflow-y: auto;">
        <table class="table table-bordered table-hover" *ngIf="filteredStockMovements().length > 0; else noResults">
            <thead class="table-light">
              <tr>
                <th>Product ID</th>
                <th>Movement Type</th>
                <th>Quantity</th>
                <th>Source</th>
                <th>Destination</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let movement of filteredStockMovements()">
                <td>{{ movement.productId }}</td>
                <td>{{ movement.stockMovementType  | movementTypeLabel }}</td>
                <td>{{ movement.quantity }}</td>
                <td>{{ movement.sourceLocation || '-' }}</td>
                <td>{{ movement.destinationLocation || '-' }}</td>
                <td>{{ movement.createdAt | date: 'short' }}</td>
              </tr>
            </tbody>
          </table>
    </div>  
    
    <ng-template #noResults>
        <div class="text-danger mt-3">
          No stock movements found.
        </div>
      </ng-template>
  </div>
  
stock-list.component.ts:
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StockMovement } from '@models/stock-movement.model';
import { StockService } from '@services/stock.service';

@Component({
  selector: 'app-stock-list',
  templateUrl: './stock-list.component.html',
})
export class StockListComponent implements OnInit {
  stockMovements: StockMovement[] = [];
  search: string = '';

  constructor(private stockService: StockService, private router: Router) {}

  ngOnInit(): void {
    this.fetchStockMovements();
  }

  fetchStockMovements(): void {
    this.stockService.getAllStockMovements().subscribe({
      next: (data) => this.stockMovements = data,
      error: (err) => console.error('Failed to fetch stock movements:', err)
    });
  }

  filteredStockMovements(): StockMovement[] {
    if (!this.search) return this.stockMovements;

    const term = this.search.toLowerCase().trim();

    return this.stockMovements.filter(movement =>
      movement.productId.toString().includes(term) ||
      (movement.sourceLocation?.toLowerCase().includes(term) || '') ||
      (movement.destinationLocation?.toLowerCase().includes(term) || '')
    );
  }

  openAddStockMovementForm() {
    this.router.navigate(['stock/add']);
  }
}



stock-routing.module.ts:
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StockListComponent } from './stock-list/stock-list.component';
import { AddStockMovementComponent } from './add-stock-movement/add-stock-movement.component';

const routes: Routes = [
  { path: '', component: StockListComponent },
  { path: 'stock', component: StockListComponent },
  { path: 'add', component: AddStockMovementComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StockRoutingModule { }


stock.module.ts:

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StockRoutingModule } from './stock-routing.module';
import { StockListComponent } from './stock-list/stock-list.component';
import { AddStockMovementComponent } from './add-stock-movement/add-stock-movement.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    StockListComponent,
    AddStockMovementComponent,
  ],
  imports: [
    CommonModule,
    StockRoutingModule,
    SharedModule
  ],
})
export class StockModule { }






























