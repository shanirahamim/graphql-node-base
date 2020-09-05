var express = require('express');
var { graphqlHTTP } = require('express-graphql');
var { buildSchema } = require('graphql');
const cors = require('cors')
const data = require('./data.json');


// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
    type Query {
        hello: String,
        getVendors: [String],
        getProduct(id: String): Product,
        getProducts(name: String, vendor: String): [Product]
    }
    type Product {
        id: String
        media: [Media]
        name: String!
        order: Int
        vendor: String
    }
    type Media {
        id: String
        type: String
        url: String
    }
    `);//type Mutation {}



data.products.sort((product1, product2) => {
    if(product1.order == product2.order){
        return 0;
    }else if(product1.order > product2.order){
        return 1;
    }else if(product1.order < product2.order){
        return -1;
    }
});
let cache = [];

// The root provides a resolver function for each API endpoint
var root = {
    hello: (all, a, b,c,e) => {
        //console.log(a);//, a, b,c,e)
        return 'Hello world!';
    },
    getProducts: ({ name, vendor, order }) => {

        console.log("filter by", name, vendor, order);
        // todo: check if a cached result;
        let searchResult = data.products.filter((product) => {
            return ((!vendor || product.vendor == vendor) &&
                (!name || name == product.name) &&
                (!order || order == product.order));
        });

        if (!searchResult || searchResult.length == 0) {
            // todo: set in cache

        }
        // todo: set in cache
        return searchResult;
    },
    getProduct: ({ id }) => {
        if (!cache[id]) {
            // todo: check if a cached result;
            let searchResult = data.products.filter((product) => {
                return (product.id == id);
            });

            if (!searchResult || searchResult.length == 0) {
                // todo: set in cache
                cache[id] = "X"; // todo: something better
            }

            // todo: set in cache
            cache[id] = searchResult[0];
        }

        if (cache[id] === "X") {
            throw new Error(`product with id ${id} not found`);
        }

        return cache[id];
    },
    getVendors: () => {
        return data.vendors;
    }
};

var app = express();
app.use(cors());
app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
}));

app.listen(4000);
console.log('Running a GraphQL API server at http://localhost:4000/graphql');
