import {implementContract, noteCreateContract} from "./contracts";

async function createNote(contract) {
    implementContract(noteCreateContract, contract);
}
