import ParallaxyAttributesHandler from "core/attr-handler";
import ParallaxyObserver from "core/observer";
import { Parallaxy } from "core/parallaxy";

document.addEventListener("DOMContentLoaded", function () {
  ParallaxyAttributesHandler(
    Array.from(document.querySelectorAll("[data-prl-y], [data-prl-x]"))
  );
  ParallaxyObserver();
});

export default Parallaxy;
