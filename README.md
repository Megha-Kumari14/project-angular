# project-angular


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




































