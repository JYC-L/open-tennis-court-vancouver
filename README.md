# Team 16 - CourtFinder

## Team Members

- Yiping (Francis) Huang
- Lewis Li
- Shu (Charlie) Chen
- Jonathon (Tong) Liu

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

- Designed and exposed backend court availability data to the frontend via RESTful API endpoints.
- Built an Express server with well-structured route handlers for retrieving court availability.
- Implemented `GET /api/availability` endpoint with support for filtering by:
  - `court` (court name or ID),
  - `start_date`, `end_date` (ISO date range), and
  - `requested_at` (client time for freshness validation).
- Added input validation and sanitization for incoming requests.
- Implemented a basic `PUT` route for updating schedules using the DataManager.
