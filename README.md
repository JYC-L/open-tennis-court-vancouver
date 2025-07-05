# Team 16 - CourtFinder

## Team Members

- Yiping (Francis) Huang
- Lewis Li
- Shu (Charlie) Chen
- Jonathan (Tong) Liu

## Project Description

We are building a website called VancouverTennis for local tennis lovers who want to book exclusive tennis court sections without paying expensive tennis club membership fees. This website will provide a joined calendar which helps users to easily explore the availability of bookable tennis courts in Metro Vancouver. We would collect these availability data and redirect users to their target booking webpage without the tedious process of checking the availability website by website and page by page. In addition, we expect to include local tennis court map and local tennis events into this website.

## Notice

At this milestone, although we have finished the backend scraper development, backend framework is not runnable yet. Therefore, please only refer to our frontend.
Please only go to http://localhost:8080 to try our frontend.

## Instructions

- docker-compose down
- docker-compose up --build
- visit http://localhost:8080

---

## Milestones

### Milestone 1

#### Project Setup

- Develope the complete frontend UI for the MVP features with sample data.
- Build a list of web scraper for the main feature, but backend does no have to be completed at this point.

#### Component Structure

- CourtFinder (main component)
- CourtsDetail (sub-component of CourtFinder)
- Home (home page)
- MobileBottomNav (Nav UI component)
- PCtopNav (Nav UI component)

#### UI Progress

- Applied effective styling to the main component and supporting components.
- Completed a key piece of the UI prototype for the event and court display.

#### Progress Toward Goals

- Demonstrated progress toward the minimal goal of displaying and filtering tennis court events by location and date. The court calendar (CourtFinder) also has a series of intuitive UI features that improve user experience.

### Milestone 2

#### Frontend Update

- Explore Page changed into Home Page with corresponding buttons.
- Past dates on the calendar become unclickable with a different UI style
- Filtering Dropdown table becomes dynamic
- Date controler button becomes dynamic
- Weekday indicator becomes dynamic
- Hourly time slot UI improvement
- Reduce Slice EventsMapStore Implemented with deleteOldEventsMap(), moveNewEventsMapToOld(), and addNewEventsMap()
- API Response Data cleaning and manipulation implemented

#### Backend Update

Back-end design diagram
[Blank diagram.pdf](https://github.students.cs.ubc.ca/CPSC455-2025S/team16/files/1058/Blank.diagram.pdf)

- Designed and exposed backend court availability data to the frontend via RESTful API endpoints.
- Built an Express server with well-structured route handlers for retrieving court availability.
- Implemented `GET /api/availability` endpoint with support for filtering by:
  - `court` (court name or ID),
  - `start_date`, `end_date` (ISO date range), and
  - `requested_at` (client time for freshness validation).
- Added input validation and sanitization for incoming requests.
- Implemented a basic `PUT` route for updating schedules using the DataManager.
- Added an orchestrator that's responsible for all scrappers.
  - Ochestrator conducts a scheduled scrape at an 30 min interval with +- 10 min interval. (This can be dynamically set).
  - Ochestrator conducts a on-demand update when frontend requests so.
- Added an availability manager that handles data pulling logic.
  - Availability manager ensures the freshness of data. It checks the timestamp of the last updated information. If the users's demand is getting staled data, it will order the orchestrator to do an on-demand update.
  - To avoid overwhelming update requests, the manager will deliver data within a cutoff threshold. It's currently set to 5 min.
- Integrated MongoDB into the project for data persistance
  - The database interface (CourtScheduleRepository and MongoConnection) provides functions to retrieve availability data, insert new data into the database, and query data based on various parameters such as date, start hour, club name, court number, and location.
  - The database layer also includes mechanisms to ensure data integrity. Each availability document contains a synthetic primary key (composed of clubName, courtNumber, startTime, and date), which is used to perform upserts, deduplicate records, and ensure the most recent data is preserved during bulk updates.

### Milestone 3

#### Frontend Update

- Fixed all the previous date bugs (User may junp to past day by clicking on prev buttons)
- Data Update time is shown on both PC view and mobile view
- Court events are split into different columns. Each column stands for one club which is a more friendly UI.
- Now only the schedule part is scrollable. The top panel and side mini calendar will remain still when user scrolling the court schedule.
- Now the color of event indicates the status of court. The dark color means there are at least a court in the 'book now' status. The light color meas all the courts in this event are in the 'bookable' but not ready for book status.

#### Backend Update

##### Logging System

All the important system scrapping activity will be recorded into a series of logs. Error messages will also be recorded for the future debugging during production.

##### API Test Suite

Our API is thoroughly tested using Mocha and Chai. You can run the test suite via the command line and generate an HTML report of the results.

**To run the tests and generate HTML output:**

1. **Install dependencies** (if you haven’t already):

   ```bash
   cd backend
   npm install
   ```

2. **Run the test suite and generate an HTML report:**
   ```bash
   npm test
   ```
   This will create a `mochawesome-report` folder in the `backend` directory. Open `mochawesome-report/mochawesome.html` in your browser to view the test results.

###### Test Suite Location

- All tests are located in:  
  [`backend/src/test/api.test.js`](https://github.students.cs.ubc.ca/CPSC455-2025S/team16/tree/Milestone3/backend/src/test/api.test.js)

##### Orchestrator Module
- **Unified timezone handling**: Standardized all time calculations to PST for consistency
- **In-memory caching**: Stores scraped data to serve repeated requests without re-scraping
- **Smart scheduling**: Scrapes at 1st and 45th minutes hourly (5 AM-10 PM) based on user demand patterns
- **Concurrency protection**: Returns cached data when scraping is in progress to prevent resource conflicts
- **Structured logging**: Added Class.method format for easier debugging

To test Orchestrator: navigate to `backend/src/services`, run `npx mocha Orchestrator.spec.js`.

In other words: `cd backend/src/services && npx mocha Orchestrator.spec.js`.

##### DataManager Module
- **Tiered data retrieval**: Prioritizes fresh cached data, falls back to database when cache is unavailable
- **Enhanced error handling**: Consistent logging format for better system monitoring

To test DataManager: navigate to `backend/src/services`, run `npx mocha DataManager.spec.js`.

In other words: `cd backend/src/services && npx mocha DataManager.spec.js`.