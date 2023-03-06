//Example fetch using pokemonapi.co
document.querySelector('button').addEventListener('click', getFetch)


function getFetch(){
  const choice = document.querySelector('input').value.replaceAll(' ', '-').replaceAll('.', '').toLowerCase()
  const url = `https://pokeapi.co/api/v2/pokemon/${choice}`

  fetch(url)
      .then(res => res.json()) // parse response as JSON
      .then(data => {
        console.log(data)
        const potentialPet = new PokeInfo (data.name, data.height, data.weight, data.types, data.sprites.other['official-artwork'].front_default, data.location_area_encounters)

        potentialPet.getTypes();
        potentialPet.isItHousePet();
      
        
        let decision = '';
        if(potentialPet.housePet === true){
          potentialPet.encounterInfo()
      
          decision = `This Pokemon is small enough, light enough, and safe enough to be a good pet!`
          
        } else {
          decision = `This Pokemon would not be a good pet because ${potentialPet.reason.join(' and ')}`
          document.getElementById('location').innerText = ''
          document.getElementById('pokemon-location').innerText = ''
        }
        document.querySelector('h2').innerText = decision;
        document.querySelector('img').src = potentialPet.image
        console.log(potentialPet.reason)
        console.log(potentialPet.housePet)

        //pull from json object
      })
      .catch(err => {
          console.log(`error ${err}`)
      });
}
class Poke {
  constructor(name, height, weight, types, image){
    this.name = name
    this.height = height
    this.weight = weight
    this.types = types
    this.image = image
    this.housePet = true
    this.reason = [] 
    this.typeList = []
  }

  //loop through pokemon types for type names
  getTypes(){
    for(const property of this.types){
      this.typeList.push(property.type.name)
    }
    console.log(this.typeList)
  }

  weightToPounds (weight) {
    //round 2 decimal places
    return Math.round((weight/4.536)*100)/100
  }

  heightToFeet(height){
    return Math.round((height/3.048)*100)/100
  }

  isItHousePet(){
    //check height, weight, and types
    let badTypes = ['fire', 'electric', 'fighting', 'poison', 'ghost', 'psychic']
    if(this.weightToPounds(this.weight) > 400){
      this.reason.push(`It is too heavy at ${this.weightToPounds(this.weight)} lbs`)
      this.housePet = false
    }
    if(this.heightToFeet(this.height) > 7){
      this.reason.push(`It is too tall at ${this.heightToFeet(this.height)} feet`);
      this.housePet = false
    }
    if(badTypes.some(r=> this.typeList.indexOf(r)>=0)){
      this.reason.push(`It's type is too dangerous`)
      this.housePet = `false`
    }
  }

}//end of Poke class

//all info from Poke is passed into PokeInfo and can now call PokeInfo inside the fetch() near line 10
class PokeInfo extends Poke {
  constructor(name, height, weight, types, image, location){
  super(name, height, weight, types, image)//build Poke then send me the information
  this.locationURL = location
  this.locationList = []
  this.locationString = ''
  this.pokemonLocation = ''
  }

  encounterInfo(){
    fetch(this.locationURL)
      .then(res => res.json())
      .then(data => {
        console.log(data)
        for(const item of data){
          this.locationList.push(item.location_area.name)
        }
        console.log(data.length)
        let target = document.getElementById('location')
        if(data.length===0){
          console.log('+ 0')
         /*!!!!*/ document.getElementById('pokemon-location').innerText = `It looks like ${this.name} is laying low right now. Please check again later.`
          target.innerText = ''
        } else {
          console.log('else')
          document.getElementById('pokemon-location').innerText = `You can find ${this.name} in the following location(s):`
        target.innerText = this.locationCleanup()
        }
      })
      .catch(err => {
        console.log(`error ${err}`)
      });

  }

  locationCleanup(){
    const words = this.locationList.slice(0,5).join(', ').replaceAll('-', ' ').split(' ')
    console.log(words)

    words.unshift('-')

    for(let i = 0; i<words.length; i++){
      words[i] = words[i][0].toUpperCase() + words[i].slice(1)

    }
    return words.join(' ').replaceAll(',','\n-')
  }
}
