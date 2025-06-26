
const BASE_URL = `https://www.googleapis.com/books/v1/volumes?q=`

// Aquí se guarda el contenido que se va a mostrar en la página
let mainContentElement
// Aquí se guardan los objetos de los items de los libros
let booksList = []
// Recoge el input del usuario en la barra de búsqueda, lo formatea para que sea una url válida,
// le introduce la API KEY
// Llama a la función checkuserInput para continuar con la validación
// Devuelve un booleano
const queryValidation = () => {
    const queryInput = document.querySelector("#queryInput")
    
    const query = encodeURIComponent(queryInput.value.trim())
    const url = `${BASE_URL}${query}&key=${API_KEY}`
    const isValid = checkUserInput(query, url)
    queryInput.value = ""

    return isValid
}
// Recibe la consulta del usuario encodeada además de la url completa de la petición a al api
// Se encarga de mostrar un mensaje en caso de que el input del usuario sea inválido
// y de manda la url completa a la función de fetch en caso de que todo vaya bien.
// Devuelve un booleano
const checkUserInput = (userInput, url) =>{
    if (userInput !== "" && userInput !== undefined){
        const messageBox = document.querySelector("#messageBox")
        if (messageBox) {
            messageBox.remove()
        }
        console.log("Success")
        queryFetching(url)        
        return true     
    } else {
        messageBox("El campo de texto está vacío")
        console.warn("Input inválido.")        
        return false
    }
}
// Recibe un string con el mensaje que se va a mostrar y lo muestra en la página
const messageBox = (mensaje) => {
    console.log("Se ejecuta messageBox")
    const messageContainer = document.createElement("div")
    const messageText = document.createElement("p")
    const appSection = document.querySelector("#app") 

    messageText.textContent = mensaje

    messageContainer.append(messageText)
    messageContainer.classList.add("messageBox")
    messageContainer.id = "messageBox"

    appSection.replaceChildren(messageContainer)
    // mainContentElement = ""
}
// Función asíncrona que recibe la url completa de la petición a la API
// Gestiona los errores y llama a la función mapBooks y le pasa el array de la respuesta
// con los resultados de la petición.
async function queryFetching(url) {
    try {
        const response = await fetch(url)
        if (!response.ok){
            throw new Error("No se ha podido obtener la información")
        }
        const books = await response.json();
        // console.log(books.items)
        mapBooks(books.items)
        console.log(books.items)       
        }
                       
    catch (error) {
        console.log(error.message)
        messageBox("Error al realizar la búsqueda. Inténtelo de nuevo.")
    }   
}
// Recibe un array con los items de los libros, los formatea con un map para crear otro array
// con los datos ya formateados y los guarda en un nuevo array formattedList
// deconstruye la lista y reemplaza el contenido de mainContentElement.
const mapBooks = (booksArray) =>{
    const formattedList = booksArray.map(bookItem => {
        // Default Values
        let bookItemTitle = 'Unknown Title'
        let bookItemAuthors = 'Unknown Authors'
        let coverImgUrl = '../assets/img/no-image-available.jpg'

        if (bookItem.volumeInfo.title && bookItem.volumeInfo.title != ""){
        bookItemTitle = bookItem.volumeInfo.title;            
        }

        if (bookItem.volumeInfo.authors && bookItem.volumeInfo.authors != ""){
            bookItemAuthors = bookItem.volumeInfo.authors
        }
        if (bookItem.volumeInfo.imageLinks){
            coverImgUrl =   bookItem.volumeInfo.imageLinks?.large?.replace(/^http:/, 'https:') ||
                            bookItem.volumeInfo.imageLinks?.medium?.replace(/^http:/, 'https:') ||
                            bookItem.volumeInfo.imageLinks?.thumbnail?.replace(/^http:/, 'https:') || '';
            coverImgUrl += "&fife=w800"
        }

        return createBookCardGrid(bookItemTitle, bookItemAuthors, coverImgUrl, bookItem);
    })
    mainContentElement.replaceChildren(...formattedList)
// console.log("Contenido: ", mainContentElement)

}
// Recibe los datos del libro y crea la tarjeta. La prepara para que cree una nueva página individual del libro
// al hacer click en la tarjeta.
// Crea y gestiona la funcionalidad del botón de añadir a la lista
// Devuelve del libro la tarjeta formateada
function createBookCardGrid(bookTitle, bookAuthors, coverImgUrl, bookItem){
    console.log(bookItem)
    const appSection = document.querySelector("#app") 

    const bookTitleContainer = document.createElement("p")
    const coverImg = document.createElement("img")
    const authorsName = document.createElement("p")
    const bookArticle = document.createElement("article")
    const addtoListButton = document.createElement("button")

    
    bookArticle.classList.add("bookCard")
    coverImg.src = coverImgUrl || "../assets/img/no-image-available.jpg"
    coverImg.alt = "Cover Image"
    coverImg.classList.add("coverImg")
    bookTitleContainer.textContent = bookTitle
    authorsName.textContent = bookAuthors

    addtoListButton.classList.add("cardAddBtn")
    const exists = bookAlreadyInList(bookItem.id)

    if(exists){
            addtoListButton.textContent = "Añadido"
            addtoListButton.classList.add("added")
    } else { 
            addtoListButton.textContent = "Añadir a la lista"
            addtoListButton.classList.add("notAdded")
            }  

    bookArticle.appendChild(bookTitleContainer)
    bookArticle.appendChild(coverImg)
    bookArticle.appendChild(authorsName)
    bookArticle.appendChild(addtoListButton)

    bookArticle.addEventListener("click", () => appSection.replaceChildren(createBookPage(bookTitle, coverImgUrl, bookItem)))
    
    addtoListButton.addEventListener("click", (e) => {
        e.stopPropagation()
        toggleListButton(addtoListButton, bookItem)
    })

    return bookArticle
}
// Recibe el elemento del botón añadir a la lista y el item del libro
// Comprueba qué clase tiene el botón y lo reemplaza con la contraria.
// Luego llama a la función handleBooks indicándole la acción "add" o "quit"
function toggleListButton(buttonElement, bookItem){
    const buttonClasses = buttonElement.classList

        if (buttonClasses.contains("notAdded")){
            buttonElement.textContent = "Añadido"
            buttonClasses.replace("notAdded", "added")
            handleBooksList("add", bookItem)
        }
         else if(buttonClasses.contains("added")){
            buttonElement.textContent = "Añadir a mi lista"
            buttonClasses.replace("added", "notAdded")
            handleBooksList("quit", bookItem)      
         }

}
// Recibe la id del item del libro y devuelve un booleando después de comprobar si está
// en la lista de libros guardados
function bookAlreadyInList(bookItemId){

    return booksList.some(book => book.id == bookItemId)

}

// Recibe un string con la acción a realizar y el item del libro
// Si el libro no existe lo añade a la lista de libros guardados
// Si la acción es "add" creo que nunca va a existir porque ya hago la comprobación en la función createBookCard
// por lo que nunca se ejecutaría el else, pero prefiero pecar de precavido.
// En caso de quitar el elemento filtra la lista de libros guardados sin el item indicado
function handleBooksList(action, bookItem){

    if (action === "add"){
        const exists = bookAlreadyInList(bookItem.id)

        if (!exists){
        booksList.push(bookItem)
        console.log(booksList)
        console.log("Libro añadido con éxito")
        }
        else {
            console.log("Este libro ya está en la la lista")
        }
    }

    if (action === "quit"){
        booksList = booksList.filter(book => book.id != bookItem.id)
        console.log(booksList)
        console.log("Libro eliminado con éxito")

    }

}
// Recibe los datos del item y crea la página individual del libro
function createBookPage(title, coverImgUrl, book){
        console.log(book)
        const bookSection = document.createElement("div")
        const coverImage = document.createElement("img")
        const bookTitle = document.createElement("h1")
        const bookDescription = document.createElement("p")
        const bookAuthors = document.createElement("h2")
        const bookGenre = document.createElement("p")
        const bookPublisher = document.createElement("p")
        const bookPublishingDate = document.createElement("p")
        const addtoListButton = document.createElement("button")


        const bookDetails = book.volumeInfo

        const notAvailable = "No disponible"

        bookSection.id = "bookPage"
        coverImage.src = coverImgUrl
        bookTitle.textContent = title || notAvailable
        bookAuthors.textContent = bookDetails.authors || notAvailable
        bookDescription.textContent = bookDetails.description
        bookGenre.textContent = `Género: ${bookDetails.categories?.[0] || notAvailable}`
        bookPublisher.textContent = `Publicado por: ${bookDetails.publisher || notAvailable}`
        bookPublishingDate.textContent = `Fecha de publicación: ${bookDetails.publishedDate || notAvailable} `
        
        bookSection.classList.add("bookPage-Container")
        coverImage.classList.add("bookPage-CoverImg")
        addtoListButton.classList.add("bookPage-Btn")
        bookDescription.classList.add("bookPage-Description")

        const exists = bookAlreadyInList(book.id)

        if(exists){
                addtoListButton.textContent = "Añadido"
                addtoListButton.classList.add("added")
        } else { 
                addtoListButton.textContent = "Añadir a la lista"
                addtoListButton.classList.add("notAdded")
            }

            bookSection.append(
                bookTitle,
                coverImage,
                addtoListButton,
                bookAuthors,
                bookDescription,
                bookGenre,
                bookPublisher,
                bookPublishingDate
            );


        addtoListButton.addEventListener("click", () => {            
                toggleListButton(addtoListButton, book)
    })
        return bookSection
}
// Espera a que la página esté cargada y activa los primeros listeners
window.onload = () => {
    const searchForm = document.querySelector("#searchForm")   
    const appSection = document.querySelector("#app") 
    const mainContainer = document.createElement("div")
    const showMyListButton = document.querySelector("#myListButton")


    mainContainer.id = "grid-app"
    mainContainer.classList.add("grid-app")


    showMyListButton.addEventListener("click", () =>{

        const isEmpty = booksList.length === 0
        
        if (!isEmpty){
            console.log("Se ejecuta")
            mapBooks(booksList)
            mainContentElement = mainContainer
            appSection.replaceChildren(mainContentElement)

        } else{ 
            messageBox("Tu lista está vacía")
            console.log("La lista ya está vacía")
        }
    })

    searchForm.addEventListener("submit", function(e) {
        e.preventDefault()
        
        const isValid = queryValidation()
        
        if (isValid){
        mainContentElement = mainContainer
        appSection.replaceChildren(mainContentElement)
        }
    })  
}

