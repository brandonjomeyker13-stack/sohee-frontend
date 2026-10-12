export interface LegalSection {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface LegalDoc {
  title: string;
  subtitle: string;
  updated: string;
  sections: LegalSection[];
}

export const LEGAL_UPDATED = "29 de julio de 2026";

export const TERMS: LegalDoc = {
  title: "Términos y Condiciones de Uso y Compra",
  subtitle: "Sohee",
  updated: LEGAL_UPDATED,
  sections: [
    {
      title: "1. Objeto y Aceptación",
      paragraphs: [
        "Los presentes Términos y Condiciones regulan el acceso y uso de la tienda en línea Sohee, así como la relación entre el comercio y las personas que se registran y/o realizan compras a través de la plataforma.",
        "El registro en la plataforma y/o la realización de una compra implica la aceptación plena de estos Términos y Condiciones, así como de la Política de Tratamiento de Datos Personales. Si el usuario no está de acuerdo con alguno de estos términos, debe abstenerse de usar la plataforma.",
      ],
    },
    {
      title: "2. Identificación del Vendedor",
      bullets: [
        "Responsable: Kamely Deney Vanegas Silva (persona natural, comerciante independiente)",
        "Cédula de ciudadanía: 1004911463",
        "Domicilio: Villa del Rosario, Norte de Santander, Colombia",
        "Correo electrónico: deneyvanegas@gmail.com",
        "Teléfono: 301 336 3954",
      ],
      paragraphs: [
        "Este negocio opera actualmente como persona natural. En caso de formalizarse bajo una razón social y/o NIT, este documento será actualizado.",
      ],
    },
    {
      title: "3. Productos y Precios",
      paragraphs: [
        "Los productos ofrecidos, sus características y precios se muestran en la plataforma al momento de la compra. Todos los precios están expresados en pesos colombianos (COP).",
        "La disponibilidad de los productos está sujeta al stock real al momento de la compra. Si un producto se agota, la plataforma no permitirá completar la compra de esa unidad. Los precios pueden ser modificados sin previo aviso; sin embargo, el precio aplicable a cada compra será siempre el vigente y visible al momento en que el pedido fue confirmado y pagado.",
      ],
    },
    {
      title: "4. Proceso de Compra",
      paragraphs: ["Para realizar una compra, el usuario debe:"],
      bullets: [
        "Registrarse en la plataforma (con correo y contraseña, o con su cuenta de Google) y aceptar estos Términos y la Política de Tratamiento de Datos.",
        "Seleccionar los productos deseados y agregarlos al carrito de compras.",
        "Confirmar el pedido, momento en el cual se reserva el stock correspondiente.",
        "Completar el pago a través de la pasarela de pagos habilitada.",
      ],
    },
    {
      title: "5. Medios de Pago",
      paragraphs: [
        "Los pedidos se pagan al momento de la entrega, en efectivo o por Nequi. No se cobra nada por anticipado ni se solicitan datos de tarjetas.",
        "Sohee no recibe ni almacena directamente los datos de las tarjetas de pago; estos son procesados de forma segura por la pasarela de pagos.",
      ],
    },
    {
      title: "6. Envíos y Entregas",
      bullets: [
        "A través de una empresa transportadora de cobertura nacional, con información de seguimiento cuando esté disponible.",
        "De forma personal, cuando la ubicación del comprador lo permita.",
      ],
      paragraphs: [
        "Los tiempos de entrega son estimados y pueden variar según la ciudad de destino, la transportadora y factores externos no imputables al vendedor.",
        "Cuando el pedido sea marcado como entregado, el comprador podrá confirmar su recepción desde la plataforma. Si no confirma dentro de los cinco (5) días calendario siguientes, el pedido se considerará entregado y confirmado automáticamente.",
      ],
    },
    {
      title: "7. Derecho de Retracto",
      paragraphs: [
        "De conformidad con el artículo 47 de la Ley 1480 de 2011, el comprador tiene derecho a retractarse de la compra dentro de los cinco (5) días hábiles siguientes a la entrega del producto, sin necesidad de justificar su decisión.",
        "Para ejercerlo debe informar su decisión al correo de contacto dentro del plazo señalado. El producto deberá devolverse en las mismas condiciones en que fue entregado, sin señales de uso, con su empaque original y accesorios. El valor pagado será reintegrado dentro de los treinta (30) días calendario siguientes.",
      ],
      bullets: [
        "Excepción: productos confeccionados o personalizados según especificaciones del comprador.",
        "Excepción: productos que por higiene o salud no sean aptos para devolución una vez abierto su empaque sellado.",
      ],
    },
    {
      title: "8. Garantía Legal",
      paragraphs: [
        "Todos los productos cuentan con la garantía legal establecida en la Ley 1480 de 2011 (calidad, idoneidad y seguridad).",
        "Para hacerla efectiva, el comprador debe escribir al correo indicado describiendo el defecto, adjuntando evidencia (fotos) y el comprobante de compra.",
      ],
    },
    {
      title: "9. Cancelación de Pedidos",
      paragraphs: [
        "El comprador puede cancelar un pedido desde la plataforma mientras el pago no haya sido confirmado. Una vez aprobado el pago, la cancelación se rige por las reglas de garantía y derecho de retracto.",
      ],
    },
    {
      title: "10. Cuentas de Usuario",
      paragraphs: [
        "El usuario es responsable de la confidencialidad de sus credenciales y de la actividad en su cuenta, y se compromete a dar información veraz y actualizada.",
        "Sohee podrá suspender o cancelar cuentas que incumplan estos Términos, se usen de forma fraudulenta o pongan en riesgo la seguridad de la plataforma.",
      ],
    },
    {
      title: "11. Propiedad Intelectual",
      paragraphs: [
        "Los contenidos de la plataforma (marca, logotipo, textos, fotografías y diseño) son propiedad de Sohee o de sus titulares. Queda prohibida su reproducción total o parcial sin autorización previa.",
      ],
    },
    {
      title: "12. Limitación de Responsabilidad",
      paragraphs: [
        "Sohee no será responsable por retrasos o incumplimientos derivados de fuerza mayor, caso fortuito o hechos de terceros (transportadoras o pasarela de pagos), ni por el uso indebido que el usuario haga de la plataforma o los productos.",
      ],
    },
    {
      title: "13. Peticiones, Quejas y Reclamos (PQR)",
      paragraphs: [
        "Cualquier PQR puede dirigirse a deneyvanegas@gmail.com o al teléfono 301 336 3954, y será atendida dentro de los términos de la normativa de protección al consumidor.",
      ],
    },
    {
      title: "14. Modificaciones",
      paragraphs: [
        "Sohee podrá modificar estos Términos en cualquier momento. Las modificaciones se publicarán en la plataforma y entrarán en vigor desde su publicación.",
      ],
    },
    {
      title: "15. Ley Aplicable y Jurisdicción",
      paragraphs: [
        "Estos Términos se rigen por las leyes de la República de Colombia. Las controversias se resolverán ante las autoridades competentes con domicilio en Villa del Rosario, Norte de Santander, sin perjuicio del derecho del consumidor de acudir ante la Superintendencia de Industria y Comercio (SIC).",
      ],
    },
  ],
};

export const PRIVACY: LegalDoc = {
  title: "Política de Tratamiento de Datos Personales",
  subtitle: "Sohee",
  updated: LEGAL_UPDATED,
  sections: [
    {
      title: "1. Identificación del Responsable del Tratamiento",
      paragraphs: [
        "En cumplimiento de la Ley 1581 de 2012, el Decreto 1377 de 2013 y el Decreto 1074 de 2015, el Responsable del Tratamiento de los datos personales recolectados a través de Sohee es:",
      ],
      bullets: [
        "Nombre: Kamely Deney Vanegas Silva (persona natural, comerciante independiente)",
        "Cédula de ciudadanía: 1004911463",
        "Domicilio: Villa del Rosario, Norte de Santander, Colombia",
        "Correo electrónico: deneyvanegas@gmail.com",
        "Teléfono: 301 336 3954",
      ],
    },
    {
      title: "2. Marco Normativo",
      bullets: [
        "Constitución Política de Colombia, artículo 15.",
        "Ley Estatutaria 1581 de 2012.",
        "Decreto 1377 de 2013 y Decreto 1074 de 2015.",
        "Demás normas que las modifiquen, adicionen o sustituyan.",
      ],
    },
    {
      title: "3. Definiciones",
      bullets: [
        "Dato personal: información vinculada o asociable a personas naturales determinadas o determinables.",
        "Titular: persona natural cuyos datos son objeto de tratamiento.",
        "Tratamiento: cualquier operación sobre datos personales (recolección, almacenamiento, uso, circulación o supresión).",
        "Responsable del Tratamiento: quien decide sobre la base de datos y su tratamiento.",
        "Encargado del Tratamiento: quien trata los datos por cuenta del Responsable.",
        "Autorización: consentimiento previo, expreso e informado del titular.",
      ],
    },
    {
      title: "4. Principios Aplicables",
      paragraphs: [
        "El tratamiento se rige por los principios de legalidad, finalidad, libertad, veracidad o calidad, transparencia, acceso y circulación restringida, seguridad y confidencialidad (artículo 4, Ley 1581 de 2012).",
      ],
    },
    {
      title: "5. Datos Personales Recolectados",
      bullets: [
        "Nombre completo.",
        "Correo electrónico.",
        "Número de teléfono.",
        "Dirección de entrega y ciudad.",
        "Historial de pedidos y compras realizadas.",
        "Identificador de cuenta de Google, si inicia sesión con Google.",
      ],
      paragraphs: [
        "Sobre los datos de pago: esta plataforma NO almacena números de tarjetas ni códigos de seguridad. El pago se realiza directamente a la tienda al recibir el pedido.",
      ],
    },
    {
      title: "6. Finalidades del Tratamiento",
      bullets: [
        "Gestionar el registro y la autenticación del usuario.",
        "Procesar, confirmar y dar seguimiento a los pedidos, incluyendo la entrega.",
        "Contactar al usuario ante novedades de su pedido.",
        "Atender consultas, peticiones, quejas y reclamos (PQR).",
        "Cumplir obligaciones legales, contables y tributarias.",
        "Prevenir el fraude y proteger la seguridad de las transacciones.",
        "Mejorar la experiencia de compra y el catálogo ofrecido.",
      ],
    },
    {
      title: "7. Transferencia y Transmisión de Datos a Terceros",
      bullets: [
                "Proveedores de infraestructura tecnológica y almacenamiento en la nube, como Encargados del Tratamiento.",
        "Transportadoras o mensajería, únicamente con los datos de contacto y dirección necesarios para la entrega.",
      ],
      paragraphs: [
        "Cuando los proveedores se encuentren fuera de Colombia, la transferencia internacional cumple el Capítulo V de la Ley 1581 de 2012. Esta plataforma no vende, alquila ni comparte datos personales con fines publicitarios ajenos a la operación de la tienda.",
      ],
    },
    {
      title: "8. Derechos de los Titulares",
      bullets: [
        "Conocer, actualizar y rectificar sus datos personales.",
        "Solicitar prueba de la autorización otorgada.",
        "Ser informado sobre el uso dado a sus datos.",
        "Presentar quejas ante la Superintendencia de Industria y Comercio (SIC).",
        "Revocar la autorización y/o solicitar la supresión del dato cuando proceda.",
        "Acceder de forma gratuita a sus datos objeto de tratamiento.",
      ],
    },
    {
      title: "9. Procedimiento para Ejercer sus Derechos",
      paragraphs: [
        "Escriba a deneyvanegas@gmail.com indicando su nombre completo, el derecho que desea ejercer y una breve descripción de su solicitud.",
        "Consultas: atendidas en máximo diez (10) días hábiles, prorrogables hasta cinco (5) días hábiles adicionales informando los motivos.",
        "Reclamos: atendidos en máximo quince (15) días hábiles, prorrogables hasta ocho (8) días hábiles adicionales informando los motivos.",
      ],
    },
    {
      title: "10. Deberes del Responsable",
      bullets: [
        "Garantizar el uso adecuado y seguro de la información.",
        "Conservar la información con las condiciones de seguridad necesarias.",
        "Tramitar consultas y reclamos dentro de los plazos legales.",
        "Actualizar la información cuando el titular lo informe.",
        "Informar, a solicitud del titular, el uso dado a sus datos.",
      ],
    },
    {
      title: "11. Vigencia",
      paragraphs: [
        "Esta política rige desde su publicación y permanecerá vigente mientras se mantengan las finalidades descritas y exista relación comercial o legal con el titular. Cualquier cambio sustancial será informado por la plataforma o el correo registrado.",
      ],
    },
    {
      title: "12. Autorización del Titular",
      paragraphs: [
        "Al registrarse, marcar la casilla de aceptación y/o realizar una compra, el titular manifiesta que ha leído esta Política y autoriza de manera previa, expresa e informada el tratamiento de sus datos personales.",
      ],
    },
    {
      title: "13. Contacto",
      paragraphs: [
        "Para cualquier inquietud escriba a deneyvanegas@gmail.com o comuníquese al teléfono 301 336 3954.",
      ],
    },
  ],
};
