var express = require('express');
var request = require('request-promise');
var mysql = require('mysql');
var bodyParser = require('body-parser');

var app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended : true}));

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "weather"
  });
  
  con.connect((err) => {
    if (err) throw err;
    console.log("Connected!");
  });

async function getWeather(cities) {
    var weather_data = [];

    for (var city_obj of cities) {
        var city = city_obj.name;
        var url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=271d1234d3f497eed5b1d80a07b3fcd1`;
        
        
        var response_body = await request(url);

        var weather_json = JSON.parse(response_body);

        var weather = {
            city : city,
            temperature : Math.round(weather_json.main.temp), //to Celsius (50 - 32) × 5/9
            description : weather_json.weather[0].description,
            icon : weather_json.weather[0].icon
        };

        weather_data.push(weather);
    }

    return weather_data;
} 



app.get('/', (req, res) => {
    con.query('SELECT * FROM cities ORDER BY id DESC', (err, rows, fields) => {
        if(!err)
           getWeather(rows).then(function(results) {
               var weather_data = {weather_data : results};
               res.render('weather', weather_data);
           });
        else 
            console.log(err);
    }); 

})



app.post('/', (req, res) => {

    con.query('INSERT INTO cities (name) VALUES(?)', [req.body.city_name], (err, rows, fields) => {
        if(!err)
            console.log("Insert successfully");
        else 
            console.log(err);
    }) 
    res.redirect('/');
})

app.get('/:city', (req, res) => {
    
    let sql = "DELETE FROM cities WHERE (name) = ?";

    con.query(sql, [req.params.city], (err, rows, fields) => {
        if(!err)
            console.log("Delete successfully");
        else 
            console.log(err);
    }) 

    res.redirect('/');
})



app.listen(8000);
console.log("Server started on port 8000");
  
    


