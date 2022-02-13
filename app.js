var express = require('express');
var exphbs  = require('express-handlebars');
var port = process.env.PORT || 3000
const cors = require("cors");
const mercadopago = require("mercadopago");
var app = express();
 var url = "https://camichaves-mp-commerce-nodejs.herokuapp.com";
// var url = "http://localhost:3000";

// Agrega credenciales
mercadopago.configure({
    access_token: "APP_USR-6317427424180639-042414-47e969706991d3a442922b0702a0da44-469485398",
	integrator_id: 'dev_24c65fb163bf11ea96500242ac130004',
  });
 
  app.use(cors());
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static('assets'));
 
app.use('/assets', express.static(__dirname + '/assets'));

app.get('/', function (req, res) {
    res.render('home');
});

app.get('/detail', function (req, res) {
    res.render('detail', req.query);
});

app.listen(port);



app.post("/create_preference", (req, res) => {

    console.log(req.body)
	let preference = {
		items: [
			{
				id: "1234",
				picture_url: url + req.body.picture_url.replace('.',''),
				title: req.body.description,
				unit_price: Number(req.body.price),
				quantity: Number(req.body.quantity)
			}],
		payment_methods: {
					"excluded_payment_methods": [
						{
							"id": "amex"
						}
					],
					"excluded_payment_types": [
						{
							"id": "atm"
						}
					],
					"installments": 6,
		},
		payer: {
						"name": "Lalo",
						"surname": "Landa",
						"email": "test_user_63274575@testuser.com",
						"phone": {
							"area_code": "11",
							"number": 22223333
						},
						"address": {
							"street_name": "Falsa",
							"street_number": 123,
							"zip_code": "1111"
						}
					},
				
		back_urls: {
			"success": url + "/feedback",
			"failure": url + "/feedback",
			"pending": url + "/feedback",
		},
		auto_return: "approved",
		external_reference: "c.chaves@alumno.um.edu.ar",
		notification_url: url + "/webhook"
	};
	// 		notification_url: "http://localhost:3000/webhook"

    console.log(preference)
	mercadopago.preferences.create(preference)
		.then(function (response) {
            console.log(response.body.init_point)
			res.json({
				id: response.body.id,
				init_point: response.body.init_point
			});
		}).catch(function (error) {
			console.log(error);
		});
	});

app.get('/feedback', function(req, res) {
	console.log("PAGO EXITOSO: ")
	console.log(req.query);
	res.render('feedback', req.query);
	// res.json({
	// 	Payment: req.query.payment_id,
	// 	Status: req.query.status,
	// 	MerchantOrder: req.query.merchant_order_id
	// });
});

app.post('/webhook', function(req, res) {
	console.log("JSON WEBHOOK");
	console.log(req.body);
	res.status(200).json({req: req.body});
  });
