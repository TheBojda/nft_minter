import {
    exampleNft,
    formats,
    mintToWallet,
    owners,
    sizes,
    types,
} from "./data";
import {
    CarbonImpact,
    FoodInstance,
    HarvestProcess,
    Pokedex,
    WaterImpact,
} from "@fairfooddata/types";
import axios from "axios";
import _ from "lodash";

const nNfts = 40;

function randomArray(array: any[]) {
    return array[Math.round(Math.random() * array.length)];
}

function randomInt(min: number, max: number) {
    return Math.round(min + Math.random() * (max - min));
}

async function main() {
    for (let it = 0; it !== nNfts; it++) {
        const timestamp = randomInt(1721201400000, 1721231400000);

        let nft: Pokedex = _.merge(JSON.parse(JSON.stringify(exampleNft)), {
            instance: {
                type: randomArray(types),
                size: randomArray(sizes),
                format: randomArray(formats),
                bio: Math.random() > 0.5,
                quantity: Math.round(Math.random() * 100),
                ownerId: randomArray(owners),
                expiryDate:
                    timestamp +
                    randomInt(1 * 7 * 24 * 60 * 1000, 3 * 7 * 24 * 60 * 1000),
                process: {
                    timestamp: timestamp,
                    type: "harvest",
                    location: {
                        type: "Point",
                        coordinates: [
                            Math.random() * 360 - 180,
                            Math.random() * 180 - 90,
                        ],
                    },
                    impacts: [
                        {
                            category: "carbon",
                            quantity: randomInt(5, 30),
                        } as CarbonImpact,
                        {
                            category: "water",
                            quantity: randomInt(5, 30),
                        } as WaterImpact,
                    ],
                } as HarvestProcess,
                price: {
                    amount: randomInt(3, 13),
                },
            } as FoodInstance,
        } as Pokedex);

        // console.log(nft);
        await axios
            .post("http://localhost:3000/mint", {
                to: mintToWallet,
                content: nft,
            })
            .then((result) => console.log(result.data))
            .catch((error) => console.error(error));
    }
}

main();
