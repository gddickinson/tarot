      var deckChoice = "Rider_Waite"
      var count = 0;
      var firstRun = true;
      var firstCard = true;
      var suits = ["arcana","wands", "pents", "cups", "swords"];
      var numbers = ["Ace","2", "3", "4", "5", "6", "7", "8", "9", "10", "Page", "Knight", "Queen", "King"];
      var arcNumbers = ["The Fool","The Magician","The High Priestess","The Empress","The Emperor","The Hierophant","The Lovers","The Chariot","Justice","The Hermit","Wheel of Fortune","Strength","The Hanged Man","Death","Temperance","The Devil","The Tower","The Star","The Moon","The Sun","Judgement","The World"];

      var cards = [];
      var cardOutput = document.getElementById('cards');
      var message = document.getElementById('message');
      var choice = "Rider_Waite"

      function check(elem) {
        choice = elem.selectedIndex;
        if (choice == 0){deckChoice = "Rider_Waite";}
        if (choice == 1){deckChoice = "Marseilles";} 
        if (choice == 2){deckChoice = "Colman-Smith";}   
        }
    
      function gameStart() {
          firstCard = true;
          count = 0;
          message.innerHTML = "Reading started!";
          document.getElementById('cards').innerHTML = "";
          document.getElementById('start').style.display = 'none';
          document.getElementById('highLow').style.display = 'block';
          document.getElementById('deck').style.display = 'none';
          if (firstRun) {
              buildCards();
              firstRun = false;
          }
          shuffleArray(cards);
          cardOutput.innerHTML += showCard();
      }

      function drawCard() {
          count++;
          cardOutput.innerHTML += showCard();
          message.innerHTML = "Card drawn: "+cards[count].num+" "+cards[count].suit;
          if (count > 3) {
              endPlay();
          }
      }

      function endPlay() {
          document.getElementById('highLow').style.display = 'none';
          //message.innerHTML = "Reading Finished.";
          document.getElementById('start').style.display = 'block';
          document.getElementById('deck').style.display = 'block';
      }

      function shuffleArray(array) {
          for (var i = array.length - 1; i > 0; i--) {
              var holder = Math.floor(Math.random() * (i + 1));
              var temp = array[i];
              array[i] = array[holder];
              array[holder] = temp;
          }
          return array;
      }

      function showCard() {
          var c = cards[count];
          var hpos = (count > 0) ? count * 10 + 200 : 30;
          var imageName = "";
          var firstPart = "";
          var secondPart = "";
          var inverted = false;
          
          if (firstCard){
              firstCard = false;
              return '<div class="icardBack ' + c.suit + '" style="left:' + hpos + 'px;"></div>';
          }
          
          //generate filename for card
          firstPart = (c.suit.slice(0,2).toLowerCase());
          secondPart = (c.cardValue);          
          if (secondPart < 10){secondPart = "0"+secondPart;}         
          imageName = deckChoice+"\\"+firstPart+secondPart+".jpg";
          
          //test for inversion
          if (Math.random() < 0.5){
              inverted = true;
          }
          
          console.log(inverted)
          console.log(choice)
          
          if (inverted){
            return '<div class="icard ' + c.suit + '" style="left:' + hpos + 'px;"> <div class="cardtop suit">' + c.num + '<br></div> <div class="cardmid"><img src="' + imageName + '" width="100" height="173" class="rotate180"></div> <div class="cardbottom suit">' + c.num + '<br></div></div>';
          }
          
          return '<div class="icard ' + c.suit + '" style="left:' + hpos + 'px;"> <div class="cardtop suit">' + c.num + '<br></div> <div class="cardmid"><img src="'+imageName+'" width="100" height="173"></div> <div class="cardbottom suit">' + c.num + '<br></div></div>';
      }

      function buildCards() {
          cards = [];         
          for (s in suits) {
            var suit = suits[s][0].toUpperCase();
              
            if (suit=='A'){             
                for (n in arcNumbers) {
                  var card = {
                      suit: suits[s]
                      , num: arcNumbers[n]
                      , cardValue: parseInt(n)
                      , icon: suit
                  }
                  cards.push(card);
              }}
          
            else {
                for (n in numbers) {
                  var card = {
                      suit: suits[s]
                      , num: numbers[n]
                      , cardValue: parseInt(n) +1
                      , icon: suit
                  }
                  cards.push(card);
              }}

          }
      }

/*        //image display function - not used
        function show_image(src, width, height, alt) {
            var img = document.createElement("img");
            img.src = src;
            img.width = width;
            img.height = height;
            img.alt = alt;

            // This next line will just add it to the <body> tag
            document.body.appendChild(img);
        }*/