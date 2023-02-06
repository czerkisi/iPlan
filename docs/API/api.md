iCal API
========

This API allows you to add, retrieve, update, and delete iCal files. The iCal files are stored in MongoDB.

Endpoints
---------

### GET `/:icalFileId/events`

Retrieves the events from the iCal file with the specified `icalFileId`.

**Response**

*   200 OK: Returns a JSON object with an `events` property that contains an array of events from the iCal file.
*   404 Not Found: The iCal file with the specified `icalFileId` was not found.
*   500 Internal Server Error: An error occurred while retrieving the iCal file from the database.

### GET `/:icalFileId.ics`

Retrieves the iCal file with the specified `icalFileId` in iCal format.

**Response**

*   200 OK: Returns the iCal file in iCal format.
*   404 Not Found: The iCal file with the specified `icalFileId` was not found.
*   500 Internal Server Error: An error occurred while retrieving the iCal file from the database.

### POST `/`

Adds a new iCal file to the database.

**Request Body**

A JSON object with the following properties:

*   `fileId`: The ID of the iCal file.
*   `data`: The iCal file in iCal format.

**Response**

*   201 Created: The iCal file was successfully added to the database.
*   400 Bad Request: The request body is missing either the `fileId` or `data` property.
*   500 Internal Server Error: An error occurred while saving the iCal file to the database.

### PUT `/:icalFileId`

Updates the iCal file with the specified `icalFileId`.

**Request Body**

A JSON object with the following properties:

*   `data`: The updated iCal file in iCal format.

**Response**

*   200 OK: The iCal file was successfully updated.
*   400 Bad Request: The request body is missing the `data` property.
*   404 Not Found: The iCal file with the specified `icalFileId` was not found.
*   500 Internal Server Error: An error occurred while updating the iCal file in the database.

### DELETE `/:icalFileId`

Deletes the iCal file with the specified `icalFileId`.

**Response**

*   204 No Content: The iCal file was successfully deleted.
*   404 Not Found: The iCal file with the specified `icalFileId` was not found.
*   500 Internal Server Error: An error occurred while deleting the iCal file from the database.