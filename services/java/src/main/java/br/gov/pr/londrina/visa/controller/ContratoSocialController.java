package br.gov.pr.londrina.visa.controller;

import br.gov.pr.londrina.visa.dto.ResultadoValidacao;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/api/contrato-social")
public class ContratoSocialController {

  private static final List<String> TERMOS_FARMA = List.of(
      "farmácia", "farmacia", "manipulação", "manipulacao", "4771"
  );

  @GetMapping("/health")
  public String health() {
    return "ok";
  }

  @PostMapping(value = "/validar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResultadoValidacao validar(@RequestParam("arquivo") MultipartFile arquivo) throws IOException {
    ResultadoValidacao resultado = new ResultadoValidacao();
    List<String> alertas = new ArrayList<>();
    List<String> termosEncontrados = new ArrayList<>();

    if (arquivo.isEmpty()) {
      resultado.setValido(false);
      resultado.setErros(List.of("Arquivo vazio"));
      return resultado;
    }

    String texto = extrairTextoPdf(arquivo.getBytes());
    String textoLower = texto.toLowerCase(Locale.ROOT);

    for (String termo : TERMOS_FARMA) {
      if (textoLower.contains(termo)) {
        termosEncontrados.add(termo);
      }
    }

    boolean atividadeCompativel = !termosEncontrados.isEmpty();

    resultado.setValido(atividadeCompativel);
    resultado.setIsUltimaVersao(true);
    resultado.setAtividadeCompativel(atividadeCompativel);
    resultado.setTermosFarmaEncontrados(termosEncontrados);

    if (atividadeCompativel) {
      alertas.add("Validação básica concluída (MVP). Revisão manual recomendada.");
    } else {
      resultado.setErros(List.of("Nenhum termo farmacêutico identificado no contrato social."));
    }

    resultado.setAlertas(alertas);
    return resultado;
  }

  private String extrairTextoPdf(byte[] bytes) throws IOException {
    try (PDDocument doc = Loader.loadPDF(bytes)) {
      PDFTextStripper stripper = new PDFTextStripper();
      return stripper.getText(doc);
    }
  }
}
