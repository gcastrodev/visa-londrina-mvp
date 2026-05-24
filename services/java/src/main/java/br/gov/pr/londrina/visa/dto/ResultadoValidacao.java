package br.gov.pr.londrina.visa.dto;

import java.util.ArrayList;
import java.util.List;

public class ResultadoValidacao {
    private boolean valido;
    private Boolean isUltimaVersao;
    private Boolean atividadeCompativel;
    private String dataUltimaAlteracao;
    private String atividadeEncontrada;
    private String cnaeEncontrado;
    private List<String> termosFarmaEncontrados = new ArrayList<>();
    private List<String> alertas = new ArrayList<>();
    private List<String> erros = new ArrayList<>();

    public boolean isValido() { return valido; }
    public void setValido(boolean valido) { this.valido = valido; }

    public Boolean getIsUltimaVersao() { return isUltimaVersao; }
    public void setIsUltimaVersao(Boolean isUltimaVersao) { this.isUltimaVersao = isUltimaVersao; }

    public Boolean getAtividadeCompativel() { return atividadeCompativel; }
    public void setAtividadeCompativel(Boolean atividadeCompativel) { this.atividadeCompativel = atividadeCompativel; }

    public String getDataUltimaAlteracao() { return dataUltimaAlteracao; }
    public void setDataUltimaAlteracao(String dataUltimaAlteracao) { this.dataUltimaAlteracao = dataUltimaAlteracao; }

    public String getAtividadeEncontrada() { return atividadeEncontrada; }
    public void setAtividadeEncontrada(String atividadeEncontrada) { this.atividadeEncontrada = atividadeEncontrada; }

    public String getCnaeEncontrado() { return cnaeEncontrado; }
    public void setCnaeEncontrado(String cnaeEncontrado) { this.cnaeEncontrado = cnaeEncontrado; }

    public List<String> getTermosFarmaEncontrados() { return termosFarmaEncontrados; }
    public void setTermosFarmaEncontrados(List<String> termosFarmaEncontrados) { this.termosFarmaEncontrados = termosFarmaEncontrados; }

    public List<String> getAlertas() { return alertas; }
    public void setAlertas(List<String> alertas) { this.alertas = alertas; }

    public List<String> getErros() { return erros; }
    public void setErros(List<String> erros) { this.erros = erros; }
}
