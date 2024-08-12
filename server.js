import express from "express";
import dotenv from "dotenv";
import stripe from "stripe";



dotenv.config();

const app = express();


app.use(express.static("public"));
app.use(express.json());


app.get('/', (req,res) => {
    res.sendFile("index.html", {root: "public"});
});

app.get('/success', (req,res) => {
    res.sendFile("success.html", {root: "public"});
});

app.get('/cancel', (req,res) => {
    res.sendFile("cancel.html", {root: "public"});
});

let stripeGateway = stripe(process.env.stripe_api);
let DOMAIN = process.env.DOMAIN;

app.post("/stripe-checkout", async (req, res) => {
    const lineItems = req.body.items.map((items) => {
        const unitAmount = parseInt(items.price.replace(/[^0-9.-]+/g, "") * 100);
        console.log("item-price:", items.price);
        console.log("unitAmount:", unitAmount);
        return{
            price_data: {
                currency: 'usd',
                product_data:{
                    name: items.title,
                    images: [items.productImg]
                },
                unit_amount: unitAmount,
            },
            quantity: items.quantity,
        };
    });
    console.log("lineItems:", lineItems);

    const session = await stripeGateway.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        success_url: `${DOMAIN}/success`,
        cancel_url: `${DOMAIN}/cancel`,
        line_items: lineItems,

        billing_address_collection: "required",
    });
    res.json(session.url);
});
const port = process.env.PORT || 9001;
app.listen(port, () => {

    console.log(`listening on port ${port}`);
});