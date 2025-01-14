import VerticalLayout from "./VerticalLayout.js";
import ErrorPage from "./ErrorPage.js";
import LoadingPage from "./LoadingPage.js";
import { formatDate, formatStatus } from "../app/format.js";

import Actions from "./Actions.js";

const row = (bill) => {
  return `
    <tr>
      <td>${bill.type}</td>
      <td>${bill.name}</td>
      <td>${bill.date}</td>
      <td>${bill.amount} €</td>
      <td>${bill.status}</td>
      <td>
        ${Actions(bill.fileUrl)}
      </td>
    </tr>
    `;
};

////////////////////////////// ORIGINAL FIX
// const rows = (data) => {
//   //fixes test so that it passes, but conflicts with original bug solution
//   data?.sort((a, b) => {
//     return new Date(b.date) - new Date(a.date);
//   });
//   // console.log(data);
//   const bills = data?.map((doc) => {
//     try {
//       return {
//         ...doc,
//         date: formatDate(doc.date),
//         status: formatStatus(doc.status),
//       };
//     } catch (e) {
//       // if for some reason, corrupted data was introduced, we manage here failing formatDate function
//       // log the error and return unformatted date in that case
//       console.log(e, "for", doc);
//       return {
//         ...doc,
//         date: doc.date,
//         status: formatStatus(doc.status),
//       };
//     }
//   });
//   return bills && bills.length ? bills.map((bill) => row(bill)).join("") : "";
// };

///////////////////// THIS IS ORIGINAL CODE BEFORE CORRECTION
// const rows = (data) => {
//   return data && data.length
//     ? data
//         .sort()
//         .map((bill) => row(bill))
//         .join("")
//     : "";
// };

const sortByDateDesc = (a, b) => {
  // create the dates
  const dateA = new Date(a.date);
  const dateB = new Date(b.date);

  // Return comparison for descending order
  return dateB - dateA;
};

const rows = (data) => {
  // !data checks if data is falsey, !data.length checks if data is empty array. Serves as early exit in case of runtime errors
  if (!data || !data.length) return "";

  return data
    .sort(sortByDateDesc) // Sort by date in descending order
    .map((bill) => row(bill)) // Map each bill to an HTML row
    .join(""); // Join all rows into a single string
};

export default ({ data: bills, loading, error }) => {
  const modal = () => `
    <div class="modal fade" id="modaleFile" data-testid="modaleFile" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLongTitle">Justificatif</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
          </div>
        </div>
      </div>
    </div>
  `;

  if (loading) {
    return LoadingPage();
  } else if (error) {
    return ErrorPage(error);
  }

  return `
    <div class='layout'>
      ${VerticalLayout(120)}
      <div class='content'>
        <div class='content-header'>
          <div class='content-title'> Mes notes de frais </div>
          <button type="button" data-testid='btn-new-bill' class="btn btn-primary">Nouvelle note de frais</button>
        </div>
        <div id="data-table">
        <table id="example" class="table table-striped" style="width:100%">
          <thead>
              <tr>
                <th>Type</th>
                <th>Nom</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
          </thead>
          <tbody data-testid="tbody">
            ${rows(bills)}
          </tbody>
          </table>
        </div>
      </div>
      ${modal()}
    </div>`;
};
