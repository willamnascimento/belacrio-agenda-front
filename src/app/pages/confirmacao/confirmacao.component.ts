import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-confirmacao',
  templateUrl: './confirmacao.component.html',
  styleUrls: ['./confirmacao.component.css'] // 👈 isso aqui

})
export class ConfirmacaoComponent implements OnInit {

  token: string = '';
  loading = true;
  sucesso = false;
  mensagem = '';
  notificacao: any;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    
    if (!this.token) {
      this.mensagem = 'Link inválido';
      this.loading = false;
      return;
    }

    // 🔍 Buscar dados da notificação
    this.http.get(`${environment.URL_API}/api/v1/notificacao/token/${this.token}`)
      .subscribe({
        next: (res: any) => {
          console.log(res);
          this.notificacao = res;
          this.loading = false;
        },
        error: () => {
          this.mensagem = 'Link inválido ou expirado';
          this.loading = false;
        }
      });
  }

  responder(resposta: string) {
    this.loading = true;

    this.http.post(`${environment.URL_API}/api/v1/notificacao/responder`, {
      token: this.token,
      resposta: resposta
    }).subscribe({
      next: (res: any) => {
        this.sucesso = true;
        this.mensagem = res.mensagem;
        this.loading = false;
        this.toastr.info('Sua mensagem foi confirmada com sucesso!')
      },
      error: (err) => {
        this.mensagem = err.error || 'Erro ao processar';
        this.loading = false;
      }
    });
  }
}