# Team 16 - CourtFinder

## App Summary

VancouverTennis is a comprehensive web platform designed for local tennis enthusiasts who want to book tennis courts without expensive club memberships. The application aggregates real-time availability data from multiple tennis facilities across Metro Vancouver through automated web scraping, presenting users with a unified calendar interface and interactive map to easily discover and book available courts.

## Instructions

- docker-compose down
- docker-compose up --build
- visit http://localhost:8080

## Standard Goals

All standard goals have been completed:

**Minimum Requirements:**

- Interactive and dynamic PC UI for home page - **Completed**
- Robust web scrapers for targeted court booking websites - **Completed** (Enhanced beyond requirements - all scrapers now make direct API calls and parse JSON)
- Backend database supporting basic court availability operations - **Completed** (Full functionality with concurrent request handling and stale data management)

**Standard Requirements:**

- Automated scraping and data updating pipeline - **Completed** (Smart scheduling with orchestrator system)
- Interactive and dynamic mobile UI for home page - **Completed** (Both PC and mobile views implemented and improved based on user feedback)
- Google Maps integration with nearby tennis courts and photos - **Completed**

## Stretch Goals

The following stretch goals will **not** be implemented by M5:

- Multi-page tennis lessons directory with filtering - **Dropped** (Scope too large for remaining timeline)
- Multi-page tennis events directory with filtering - **Dropped** (Scope too large for remaining timeline)
- Google OAuth user authentication and profiles - **Dropped** (Scope too large for remaining timeline)

## Non-Trivial Elements

| Element                                                          | Stage of Completion |
| ---------------------------------------------------------------- | ------------------- |
| Web Scraping Orchestrator with Smart Scheduling                  | **Completed**       |
| UBC Tennis Centre Advanced API Scraper                           | **Completed**       |
| MongoDB Integration with Synthetic Primary Keys                  | **Completed**       |
| Real-time Data Caching and Freshness Validation                  | **Completed**       |
| Concurrent Request Handling and Rate Limiting                    | **Completed**       |
| Tiered Data Retrieval Strategy                                   | **Completed**       |
| Google Maps API Integration with Interactive Court Visualization | **Completed**       |
| Comprehensive API Test Suite                                     | **Completed**       |
| Unified Timezone Handling (PST)                                  | **Completed**       |

## XSS Security Assessment

**Input Points Tested:**

- API endpoint parameters: `/api/availability` with `start_date`, `end_date`, and `court` parameters
- URL query strings and parameters

**Tests Attempted:**

- Injected script tags in date parameters: `GET /api/availability?start_date=<script>alert('xss')</script>`
- Injected malicious image tags in court parameters: `GET /api/availability?court=<img src=x onerror=alert('XSS')>`
- Tested various XSS payloads in API parameters

**Results:**

- **Secure**: No malicious payloads were reflected in API responses
- Backend consistently returned proper JSON arrays of availability data regardless of input
- No JavaScript execution occurred in the browser
- API parameters are properly handled without interpretation of HTML/JavaScript content

**Identified Risk:**

- Potential vulnerability exists if scraped websites inject malicious JSON data that could affect server processing

**Mitigation Measures:**

- Implemented rate limiting and caching strategy to prevent scraper abuse
- Backend input handling is agnostic to parameter content beyond timestamp validation
- No direct reflection of user input in responses

## M4 Highlights

**Major Changes Since Milestone 3:**

**Backend Improvements:**

- **UBC Tennis Centre Scraper Enhancement**: Completely rebuilt the UBC scraper to work in Docker environments by implementing sophisticated cookie handling and dynamic header composition to access UBC's backend API directly
- **Enhanced Test Coverage**: Added comprehensive test cases for Orchestrator and DataManager modules, including data retrieval strategy validation and operational window testing
- **Improved Error Handling**: Implemented robust error handling and logging throughout the scraping pipeline

**Frontend Enhancements:**

- **Google Maps API Integration**: Implemented interactive map visualization displaying all tennis courts with clickable pins
- **Enhanced Court Information**: Added court location pins with information bubbles containing direct links to Google Maps pages for easy navigation

**Development Experience Improvements:**

- **Root-level npm start**: Configured project to run from root directory with single command
- **Debug Configuration**: Set up debugging console to stop at breakpoints in backend files
- **Enhanced Developer Workflow**: Streamlined development process for better team productivity

**System Reliability:**

- **Stale Data Prevention**: Resolved issues where DataManager returned outdated information despite database updates
- **Orchestrator Stability**: Added complete operational window testing and enhanced scheduling reliability
- **Production Readiness**: Improved logging and monitoring for stable production deployment

**Bug List Location:**
Bug tracking is maintained in GitHub Issues with P0-P5 priority labeling system.
