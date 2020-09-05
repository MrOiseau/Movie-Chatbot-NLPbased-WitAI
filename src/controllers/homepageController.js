
// Function render homepage.ejs file
let getHomepage = (req, res) => {
    return res.render("homepage.ejs");
};

// Export to use it in routes/web.js
module.exports = { 
    getHomepage: getHomepage
};