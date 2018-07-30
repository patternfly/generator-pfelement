import RHElement from "../rhelement/rhelement.js";

class <%= elementClassName %> extends RHElement {
  static get tag() {
    return "<%= elementName %>";
  }

  get templateUrl() {
    return "<%= elementName %>.html";
  }

  get styleUrl() {
<%_ if (useSass) { _%>
    return "<%= elementName %>.scss";
<%_ } else { _%>
    return "<%= elementName %>.css";
<%_ } _%>
  }

  constructor() {
    super(<%= elementClassName %>.tag);
  }
}

RHElement.create(<%= elementClassName %>);
