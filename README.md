# uniges2

This is a small web page for the management of professors and grades
using the MVC pattern. The page is split into a REST API, whose code
has as an entry point the file `rest.php`, and a Javascript and HTML
single-page interface which has as an entry point the file `index.html`.

The models of the page are in the folder `models`. This folder is split
into a number of files which specify the entities' attributes and attribute
types, all of which inherit from the class `BaseModel`, which does the
work of persisting entities in a database using PHP's reflection facilities.

The controllers for the web page are in the folder `controller`. Again, the
class `BaseController` does most of the standard work, calling the services
for persistence, which are in the folder `service`.

The folders `js` and `view` store the frontend's scripts and HTML templates
used in the interface, respectively.
