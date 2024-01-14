import { ROUTES_PATH } from "../constants/routes.js";
import Logout from "./Logout.js";

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    const formNewBill = this.document.querySelector(
      `form[data-testid="form-new-bill"]`
    );
    formNewBill.addEventListener("submit", this.handleSubmit);
    const file = this.document.querySelector(`input[data-testid="file"]`);
    file.addEventListener("change", this.handleChangeFile);
    this.fileUrl = null;
    this.fileName = null;
    this.billId = null;
    new Logout({ document, localStorage, onNavigate });
  }
  handleChangeFile = (e) => {
    e.preventDefault();
    // console.log(e);
    const file = this.document.querySelector(`input[data-testid="file"]`)
      .files[0];
    const filePath = file.name.split(/\\/g);
    const fileName = filePath[filePath.length - 1];
    const fileType = this.getFileExtension(fileName);
    const fileTypeValid = this.checkFileType(fileType);
    const fileTypeElement = this.document.querySelector(
      ".file-type-error-message"
    );
    if (fileTypeValid) {
      fileTypeElement.classList.add("hidden");
      const formData = new FormData();
      const email = JSON.parse(localStorage.getItem("user")).email;
      formData.append("file", file);
      formData.append("email", email);

      this.store
        .bills()
        .create({
          data: formData,
          headers: {
            noContentType: true,
          },
        })
        .then(({ fileUrl, key }) => {
          // console.log(fileUrl);
          this.billId = key;
          this.fileUrl = fileUrl;
          this.fileName = fileName;
        })
        .catch((error) => console.error(error));
      this.formData = formData;
    } else {
      //do something else if file type is wrong
      // fileTypeElement.classList.remove("hidden");
      alert(
        "Mauvais format de fichier ! merci de sélectionner un fichier au format jpg, jpeg ou png."
      );
    }
  };
  handleSubmit = (e) => {
    e.preventDefault();
    // console.log(
    //   'e.target.querySelector(`input[data-testid="datepicker"]`).value',
    //   e.target.querySelector(`input[data-testid="datepicker"]`).value
    // );
    const file = this.document.querySelector(`input[data-testid="file"]`)
      .files[0];
    const fileType = this.getFileExtension(file.name);
    const fileTypeValid = this.checkFileType(fileType);

    if (fileTypeValid) {
      const email = JSON.parse(localStorage.getItem("user")).email;
      const bill = {
        email,
        type: e.target.querySelector(`select[data-testid="expense-type"]`)
          .value,
        name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
        amount: parseInt(
          e.target.querySelector(`input[data-testid="amount"]`).value
        ),
        date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
        vat: e.target.querySelector(`input[data-testid="vat"]`).value,
        pct:
          parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) ||
          20,
        commentary: e.target.querySelector(`textarea[data-testid="commentary"]`)
          .value,
        fileUrl: this.fileUrl,
        fileName: this.fileName,
        status: "pending",
      };
      this.updateBill(bill);
      this.onNavigate(ROUTES_PATH["Bills"]);
    } else {
      console.log("File type is not valid");
    }
  };

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: this.billId })
        .then(() => {
          this.onNavigate(ROUTES_PATH["Bills"]);
        })
        .catch((error) => console.error(error));
    }
  };

  checkFileType = (fileType) => {
    const types = ["jpeg", "JPEG", "jpg", "JPG", "png", "PNG"];
    return types.includes(fileType);
  };

  getFileExtension = (fileName) => {
    const fileTypeExt = fileName.split(".").pop();
    return fileTypeExt;
  };
}
