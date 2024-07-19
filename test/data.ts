import { Pokedex } from "@fairfooddata/types";

export const exampleNft: Pokedex = {
    contract: "",
    description: "",
    feedchainVersion: "",
    token: "",
    instance: {
        category: "food",
        type: "fruit",
        bio: true,
        quantity: 1,
        size: "medium",
        format: "sliced",
        process: {
            timestamp: 1721221958026,
            location: {
                type: "Point",
                coordinates: [0, 0],
            },
            temperatureRange: {
                min: 0,
                max: 100,
            },
            inputInstances: [],
            type: "harvest",
        },
        price: {
            amount: 5,
            currency: "0x18c8a7ec7897177E4529065a7E7B0878358B3BfF",
            type: "budget",
        },
        ownerId: "lidl.com",
    },
};

export const types = [
    "Apple",
    "Apricot",
    "Avocado",
    "Banana",
    "Blackberry",
    "Blueberry",
    "Cherry",
    "Coconut",
    "Cucumber",
    "Durian",
    "Dragonfruit",
    "Fig",
    "Gooseberry",
    "Grape",
    "Guava",
    "Jackfruit",
    "Plum",
    "Kiwifruit",
    "Kumquat",
    "Lemon",
    "Lime",
    "Mango",
    "Watermelon",
    "Mulberry",
    "Orange",
    "Papaya",
    "Passionfruit",
    "Peach",
    "Pear",
    "Persimmon",
    "Pineapple",
    "Pineberry",
    "Quince",
    "Raspberry",
    "Soursop",
    "Star fruit",
    "Strawberry",
    "Tamarind",
    "Yuzu",
];

export const sizes = ["small", "meduim", "large"];
export const formats = ["whole", "diced", "sliced"];
export const owners = ["aldi.com", "lidl.com", "tesco.com", "aura-labs.cc"];
export const mintToWallet = "0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199";
