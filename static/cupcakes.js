/*Class Based*/

class App {
    constructor() {
        this.case = new DisplayCase();
        this.form = new CupcakeForm();
        $('body').prepend(this.form.$form);
        $('body').prepend(this.case.$displayCase);
    }
}

class DisplayCase {
    constructor() {
        this.items = [];
        this.$displayCase = $('<div class="case"></div>');
    }
    renderDisplayCase() {
        this.$displayCase.empty();
        for (let item of this.items) {
            const itemHTML = item.generateHTML();
            this.$displayCase.append(itemHTML);
        }
    }
    async fetchAllCupcakes() {
        const resp = await axios.get(`/api/cupcakes`);
        const items = resp['data'][`cupcakes`];
        for (const item of items) {
            const newItem = new Cupcake(item.id,item.flavor,item.size,item.rating,item.image);
            this.items.push(newItem);
        }
        this.renderDisplayCase();
    }
    addToCase(item) {
        this.items.push(item);
        const itemHTML = item.generateHTML();
        this.$displayCase.append(itemHTML);
    }
}

class CupcakeForm {
    constructor() {
        this.$form = this.generateForm();
    }
    generateForm() {
        const $form = $('<form></form>');
        const flavorInput = this.createInput("Flavor:","flavor","text","form-element");
        const sizeInput = this.createInput("Size:","size","text","form-element");
        const ratingInput = this.createInput("Rating:","rating","number","form-element");
        const imageInput = this.createInput("Image URL:", "image","text","form-element");
        const submitButton = $('<button></button>')
        submitButton.text("Submit");
        submitButton.on("click",handleSubmit);
        $form.append(flavorInput);
        $form.append(sizeInput);
        $form.append(ratingInput);
        $form.append(imageInput);
        $form.append(submitButton);
        return $form
    }
    createInput(displayName,inputName,inputType,className) {
        const inputDiv = $('<div></div>');
        inputDiv.addClass(className);
        const label = $('<label></label>');
        const input = $('<input />');
        label.attr("for",inputName);
        label.text(displayName);
        input.attr("type",inputType);
        input.attr("name",inputName);
        input.attr("id",inputName);
        input.text(displayName);
        inputDiv.append(label);
        inputDiv.append(input);
        return inputDiv
    }
};

class Cupcake {
    constructor(id,flavor,size,rating,image) {
        this.id = id;
        this.flavor = flavor;
        this.size = size;
        this.rating = rating;
        this.image = image;
    }
    generateHTML() {
        const displayDiv = $('<div class="cupcake"></div>');
        const infoDiv = $('<div class="info"></div>');
        const flavorText = $(`<p class="stat">${this.flavor}</p>`);
        const ratingText = $(`<p class="stat">Rating: ${this.rating}</p>`);
        const sizeText = $(`<p class="stat">${this.size}</p>`);
        const cupcakeImage = $(`<img class="profile-image" src=${this.image} />`);
        infoDiv.append(flavorText);
        infoDiv.append(ratingText);
        infoDiv.append(sizeText);
        displayDiv.append(infoDiv);
        displayDiv.append(cupcakeImage);
        return displayDiv
    }
};

cupcakeApp = new App();
cupcakeApp.case.fetchAllCupcakes();

async function handleSubmit(e) {
    e.preventDefault();
    const $form = $('form');
    const inputs = $form.serializeArray();
    const json_request = {};
    for (input of inputs) {
        json_request[input.name] = input.value;
    }
    const response = await axios.post('api/cupcakes',json_request);
    const {id,flavor,size,rating,image} = response['data']['cupcake']
    const newCupcake = new Cupcake(id,flavor,size,rating,image);
    cupcakeApp.case.addToCase(newCupcake);
}