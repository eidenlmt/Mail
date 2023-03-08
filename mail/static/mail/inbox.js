document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  
  // submit email
  document.querySelector('#compose-form').addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});



function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}



//send the email to /emails API route
function send_email(event) {

  // prevent from loading default inbox route
  event.preventDefault()
  
  // send the POST request to /emails route
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
    })
  })

  // Load the sent mailbox 
  load_mailbox('sent');
  
  // Stop form from submitting
  return false;
}



function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;


  // get emails from emails/<str:mailbox>
  fetch('/emails/' +  mailbox)
  .then(response => response.json())
  .then(emails => {


    // create a div element for each email
    emails.forEach(email => {
      let div = document.createElement('div');
      div.className = "email-item row";
      div.innerHTML = `
      <span class="col text-start"> <b>${email['sender']}</b> </span>
      <span class="col-5 text-start"> ${email['subject']} </span>
      <span class="col text-end"> ${email['timestamp']} </span>
      `;

    // Change background-color
    
    div.classList.add(email.read ? "read": "unread");

    // add listener to div
      div.addEventListener('click', function() {
        console.log('This element has been clicked!')
        load_email(email['id'])
      });

    // append div to emails-view
      document.querySelector('#emails-view').append(div);
    });
  });
}



function load_email(id) {

  // Show email-view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // clear out email-view
  document.querySelector('#email-view').innerHTML = '';


  // get email from emails/<int:email_id>
  fetch('/emails/' + id)
  .then(response => response.json())
  .then(email => {



    // create archive button
    archiveButton = document.createElement('button');
    archiveButton.className = "btn btn-sm btn-outline-primary order-1";
    archiveButton.innerHTML = !email['archived'] ? "Archive" : "Unarchive";
    archiveButton.addEventListener('click', function() {
      fetch('/emails/' + id, {
        method: 'PUT',
        body: JSON.stringify({ archived : !email['archived'] })
      })
        // Load the Inbox mailbox 
      load_mailbox('inbox');
    });

    // only append archiveButton to email-view if it's not send by request.user
    // if (email['sender'] != request.user.email) {
    document.querySelector('#email-view').append(archiveButton);
    //};


    //email view
    const view = document.createElement('div');
    view.innerHTML = `
    <div class="container-fluid"> <b>From:</b> ${email['sender']} </div>
    <div class="container-fluid"> <b>To:</b> ${email['recipients']} </div>
    <div class="container-fluid"> <b>Subject:</b> ${email['subject']} </div>
    <div class="container-fluid"> <b>Timestamp:</b> ${email['timestamp']} </div>
    <hr>
    <div class="container-fluid order-2"> ${email['body']} </div>
    `
    // append archiveButton to email-view
    document.querySelector('#email-view').append(view);


  });


  // mark email as read
  fetch('/emails/' + id, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })

}