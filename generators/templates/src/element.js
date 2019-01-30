import PFElement from "../pfelement/pfelement.js";

class <%= elementClassName %> extends PFElement {
  static get tag() {
    return "<%= elementName %>";
  }

  get templateUrl() {
    return "<%= elementName %>.html";
  }

  get schemaUrl() {
    return "<%= elementName %>.json";
  }

  get styleUrl() {
<%_ if (useSass) { _%>
    return "<%= elementName %>.scss";
<%_ } else { _%>
    return "<%= elementName %>.css";
<%_ } _%>
  }

<%_ if (attributes.length > 0) { _%>
  static get observedAttributes() {
    return [<%_ _.join(attributes, ", ") _%>];
  }
<%_ } else { _%>
  // static get observedAttributes() {
  //   return [];
  // }
<%_ } _%>

  constructor() {
    super(<%= elementClassName %>);
  }

  // connectedCallback() {
  //   super.connectedCallback();
  // }

  // disconnectedCallback() {}

<%_ if (attributes.length > 0) { _%>
  // Process the attribute change
  attributeChangedCallback(attr, oldValue, newValue) {}
<%_ } else { _%>
  // attributeChangedCallback(attr, oldValue, newValue) {}
<%_ } _%>
}

PFElement.create(<%= elementClassName %>);

export default <%= elementClassName %>;
