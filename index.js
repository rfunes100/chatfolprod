const qrcode = require('qrcode-terminal');
const axios = require('axios');
const express = require('express');
const handlebars = require('handlebars');
const dotenv = require('dotenv') //.config();

const {
   Client,
   LocalAuth
} = require('whatsapp-web.js');

const puppeteer = require('puppeteer');

async function myFunction() {
   const browser = await puppeteer.launch();
   const page = await browser.newPage();
   page.waitForNavigation() 
   page.waitForTimeout(300000000)
   await page.setDefaultTimeout( 300000000/*10000*/); // 10 segundos
   await page.goto('http://ftl-wbsrv:3702/', {timeout: 45000});
  // await browser.close();   
   // Resto de tu código aquí
}

const http = require('http');
const codbar = ''


dotenv.config()
const app = express();
app.use(express.json())


const client = new Client({
   authStrategy: new LocalAuth() ,
     puppeteer: {
       args: ['--no-sandbox'],
       }
});


client.on('ready', () => {
   myFunction();
   console.log('Client is ready!');

});





let consultas  = []


client.on('message', async (message) => {

  
  if (message.body.toLowerCase() === 'menu') { // verificar si el mensaje es 'empezar cuestionario'

    await client.sendMessage(message.from, '1) Revisar comprobante de pago\n2) Revision de marcas'); // enviar la primera pregunta
   // console.log(message)

  }else{
    return
  }


});




function menu(chatid){
  client.sendMessage( chatid , 'Ingrese la palabra menu'); // enviar la primera pregunta

}

client.on('message', async (message) => {

  let empevo;
   let codigoemp
   let responses = {};
   let telefono



  if (message.fromMe) {
    return;
 }

 if (message.body.toLowerCase() === '1') {


    let celular = message.from;
    celular = celular.substring(0, celular.length - 5);


    responses.codigo = message.body; // almacenar la respuesta en la variable 'responses'
    codigoemp = message.body;
    

    try {
       const response = await axios.get(`${process.env.EVO_URL}/api/Empleado/GetByTel/${celular}`);
       const data = response.data;
   
      if(response.data.Contenido.length > 0){
         empevo = data.Contenido[0].emp_CodEvo
         telefono = data.Contenido[0].emP_TELEFONO
  

      }else{
         client.sendMessage(message.from, 'numero no registrado en la base');
         menu(message.from)
         return
      }

      

       //  res.json(data);
    } catch (error) {
       console.error(error);
       res.status(500).send('Error interno del servidor');
    }


    try {
       const response = await axios.get(`${process.env.EVO_URL}/api/ingresos/getcomprobanteempleado/${empevo}`);


       const data = response.data;


       const filteredData = data.Contenido.map(({
          tiempo,
          valor,
          descripcion,
       }) => ({
          tiempo,
          valor,
          descripcion
       }));
       let empresa = String(JSON.stringify(filteredData)) // JSON.stringify ( filteredData )   
       empresa = empresa.slice(1, -1)


       const replacements = {
          tiempo: 'HORAS',
          valor: 'VALOR',
          "}": '',
          "{": '',
          '"': '',
          ',': ' ',
          ':': ' ',
          descripcion: ' '
       };


       const newString = empresa.replace(
          new RegExp(Object.keys(replacements).join('|'), 'g'),
          match => replacements[match]
       );

       const palabra = newString.replace(/\\n/g, '\n')
       const palabras = palabra.replace(`/\//g`, '')


       //console.log('palabra',palabras );

       let str = message.from;
       str = str.substring(0, str.length - 5);


       //  console.log('numeros',str, telefono,  )
       // console.log('empresa ', empresa)
       if (str === telefono) {
          //  console.log('empresa dentro de telefono ', empresa)
          client.sendMessage(message.from, palabras.substring(17));               
        //  message.body = ''
         //   return 

//setTimeout(() => {
            menu(message.from)
         //// }, 10000);
          


       } else {
          client.sendMessage(message.from, 'numero no registrado en la base');

       }
       //  res.json(data);
    } catch (error) {
       console.error(error);
       res.status(500).send('Error interno del servidor');
    }

 



 } else if (message.body.toLowerCase() === '2') {


    let celular = message.from;
    celular = celular.substring(0, celular.length - 5);

    responses.codigo = message.body; // almacenar la respuesta en la variable 'responses'
    codigoemp = message.body;
   
    try {

       const response = await axios.get(`${process.env.EVO_URL}/api/Empleado/GetByTel/${celular}`);
       const data = response.data;
     //  console.log('ingesa al paso 2', response.data.Contenido.length, response.data.Contenido )

       if(response.data.Contenido.length > 0){
       empevo = data.Contenido[0].emP_CODIGO
       telefono = data.Contenido[0].emP_TELEFONO
     //  console.log('ingesa al paso 2')
       }
       else{
         client.sendMessage(message.from, 'numero no registrado en la base');
         menu(message.from)
         return

       }


    } catch (error) {
       console.error(error);
       res.status(500).send('Error interno del servidor');
    }

    try {
       const response = await axios.get(`${process.env.PROMETEO_URL}/v1_1/planilla/marcacionesemp/${empevo}?token=${process.env.TOKEN}`);

       const data = response.data;

       const filteredData = data.Contenido.map(({
          marca
       }) => ({
          marca
       }));
       //    console.log('filteredData', filteredData)
       let empresa = String(JSON.stringify(filteredData)) // JSON.stringify ( filteredData )   
       empresa = empresa.slice(1, -1)


       const replacements = {
          tiempo: 'HORAS',
          valor: 'VALOR',
          "}": '',
          "{": '',
          '"': '',
          ',': ' ',
          ':': ' ',
          descripcion: ' '
       };

       const newString = empresa.replace(
          new RegExp(Object.keys(replacements).join('|'), 'g'),
          match => replacements[match]
       );

       const palabra = newString.replace(/\\n/g, '\n')

       //console.log('palabra', palabra)

       const palabras = palabra.replace(`/\//g`, '')


       let str = message.from;

       str = str.substring(0, str.length - 5);

       if (str === telefono) {

      //  console.log(consultas)
        
          client.sendMessage(message.from, palabras);
        
          //  message.body = ''
          
         // setTimeout(() => {
            menu(message.from)
        //  }, 10000);
            

       } else {
          client.sendMessage(message.from, 'numero no registrado en la base');

       }
       //  res.json(data);
    } catch (error) {
       console.error(error);
       res.status(500).send('Error interno del servidor');
    }

 }
 else if (message.body.toLowerCase() === 'menu'){
  return
 }
 else {
  menu(message.from)
  return
 // menu(message.from)
 }


});



/*

client.on('message', async (message) => {
   let empevo;
   let codigoemp
   let responses = {};
   let telefono
   

   if (message.body.toLowerCase() === 'menu') { // verificar si el mensaje es 'empezar cuestionario'


      responses = {}; // reiniciar las respuestas del usuario

      consultas.push(message.from)
      
      console.log('cantidades',message.from , message.body.length)
      console.log(message)
      //menu(message.from)
      await client.sendMessage(message.from, '1) Recibir comprobante de pago\n2) Revision de marcas'); // enviar la primera pregunta

      // Esperamos la respuesta del usuario
      client.on('message', async (response) => {
         // Verificamos que la respuesta sea del usuario y no del bot
         if (response.fromMe) {
            return;
         }

         if (response.body.toLowerCase() === '1') {


            let celular = message.from;
            celular = celular.substring(0, celular.length - 5);


            responses.codigo = message.body; // almacenar la respuesta en la variable 'responses'
            codigoemp = message.body;


            try {
               const response = await axios.get(`${process.env.EVO_URL}/api/Empleado/GetByTel/${celular}`);
               const data = response.data;
               empevo = data.Contenido[0].emp_CodEvo
               telefono = data.Contenido[0].emP_TELEFONO


               //  res.json(data);
            } catch (error) {
               console.error(error);
               res.status(500).send('Error interno del servidor');
            }

            try {
               const response = await axios.get(`${process.env.EVO_URL}/api/ingresos/getcomprobanteempleado/${empevo}`);


               const data = response.data;


               const filteredData = data.Contenido.map(({
                  tiempo,
                  valor,
                  descripcion,
               }) => ({
                  tiempo,
                  valor,
                  descripcion
               }));
               let empresa = String(JSON.stringify(filteredData)) // JSON.stringify ( filteredData )   
               empresa = empresa.slice(1, -1)


               const replacements = {
                  tiempo: 'HORAS',
                  valor: 'VALOR',
                  "}": '',
                  "{": '',
                  '"': '',
                  ',': ' ',
                  ':': ' ',
                  descripcion: ' '
               };


               const newString = empresa.replace(
                  new RegExp(Object.keys(replacements).join('|'), 'g'),
                  match => replacements[match]
               );

               const palabra = newString.replace(/\\n/g, '\n')
               const palabras = palabra.replace(`/\//g`, '')


               //console.log('palabra',palabras );

               let str = message.from;
               str = str.substring(0, str.length - 5);


               //  console.log('numeros',str, telefono,  )
               // console.log('empresa ', empresa)
               if (str === telefono) {
                  //  console.log('empresa dentro de telefono ', empresa)
                  client.sendMessage(message.from, palabras.substring(17));               
                //  message.body = ''
                 //   return 

//setTimeout(() => {
                    menu(message.from)
                 //// }, 10000);
                  


               } else {
                  client.sendMessage(message.from, 'numero no registrado en la base');

               }
               //  res.json(data);
            } catch (error) {
               console.error(error);
               res.status(500).send('Error interno del servidor');
            }

         } else if (response.body.toLowerCase() === '2') {


            let celular = message.from;
            celular = celular.substring(0, celular.length - 5);

            responses.codigo = message.body; // almacenar la respuesta en la variable 'responses'
            codigoemp = message.body;


            try {

               const response = await axios.get(`${process.env.EVO_URL}/api/Empleado/GetByTel/${celular}`);
               const data = response.data;
               empevo = data.Contenido[0].emP_CODIGO
               telefono = data.Contenido[0].emP_TELEFONO


            } catch (error) {
               console.error(error);
               res.status(500).send('Error interno del servidor');
            }

            try {
               const response = await axios.get(`${process.env.PROMETEO_URL}/v1_1/planilla/marcacionesemp/${empevo}?token=${process.env.TOKEN}`);

               const data = response.data;

               const filteredData = data.Contenido.map(({
                  marca
               }) => ({
                  marca
               }));
               //    console.log('filteredData', filteredData)
               let empresa = String(JSON.stringify(filteredData)) // JSON.stringify ( filteredData )   
               empresa = empresa.slice(1, -1)


               const replacements = {
                  tiempo: 'HORAS',
                  valor: 'VALOR',
                  "}": '',
                  "{": '',
                  '"': '',
                  ',': ' ',
                  ':': ' ',
                  descripcion: ' '
               };

               const newString = empresa.replace(
                  new RegExp(Object.keys(replacements).join('|'), 'g'),
                  match => replacements[match]
               );

               const palabra = newString.replace(/\\n/g, '\n')

               //console.log('palabra', palabra)

               const palabras = palabra.replace(`/\//g`, '')


               let str = message.from;

               str = str.substring(0, str.length - 5);

               if (str === telefono) {

                console.log(consultas)
                
                  client.sendMessage(message.from, palabras);
                
                  //  message.body = ''
                  
                 // setTimeout(() => {
                    menu(message.from)
                //  }, 10000);
                    

               } else {
                  client.sendMessage(message.from, 'numero no registrado en la base');

               }
               //  res.json(data);
            } catch (error) {
               console.error(error);
               res.status(500).send('Error interno del servidor');
            }

         }
         else {
          return
         // menu(message.from)
         }
         

      });


   }
  // client.removeListener('message' ,  message );


});
*/

client.initialize();

app.get('/qr', (req, res) => {

   client.on('qr', qr => {


      //    const  fecha = Date.now();

      const fecha = new Date().toLocaleDateString('en-us', {
         weekday: "long",
         year: "numeric",
         month: "short",
         day: "numeric",
         hour: "numeric",
         minute: "numeric",
         second: "numeric"
      })


      qrcode.generate(qr, {
         small: true
      }, function (code) {
         console.log(code);
         console.log('refresca Qr', fecha)

         res.send(`<!DOCTYPE html>

      <html>
     
          <head>
          <meta http-equiv="refresh" content="60">
              <title>titulo de la página</title>
          </head>
          <body>
          <div style="text-align:center" >
          </div>
         
          <h2> Codigo de QR para whassap web  ${fecha} </h2>
            <pre>${code}</pre>  
            
          </body>
      </html>`)
         // res.send(`<pre>${code}</pre>`);
      })


   });

   client.on('ready', () => {
      console.log('Client is ready!');

   });

});

app.listen(3702, function () {
   console.log('La aplicación está en ejecución en http://ftl-wbsrv:3702');
});